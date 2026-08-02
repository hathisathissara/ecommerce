// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendOrderEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { customer, items, totalAmount, paymentMethod, bankSlip, couponCode, discountAmount, shippingFee } = body;

    if (!customer || !items || items.length === 0 || !totalAmount || !paymentMethod) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    if (paymentMethod === "BankTransfer" && !bankSlip) {
      return NextResponse.json({ error: "Bank slip is required for Bank Transfer" }, { status: 400 });
    }

    // Saving the order in the database
    const newOrder = await Order.create({
      customer,
      items,
      totalAmount,
      paymentMethod,
      bankSlip: paymentMethod === "BankTransfer" ? bankSlip : undefined,
      couponCode: couponCode || undefined,
      discountAmount: discountAmount ? Number(discountAmount) : 0,
      shippingFee: shippingFee ? Number(shippingFee) : 0,
    });

    // 2. ⚡ After the order is successful, the Atomic Logic of reducing the Stock and automatically increasing the Sales Count ⚡ [2]
    for (const item of items) {
      // Because the IDs of Custom Gift Boxes are not directly MongoDB ObjectIDs, their stock/sales update is skipped
      if (item._id.startsWith("gift-box-") || item._id.startsWith("custom-gift-")) {
        continue;
      }

      // If a variant (Variant: Size + Color) is purchased
      if (item._id.includes("-")) {
        const parts = item._id.split("-");
        const prodId = parts[0];
        const size = parts[1] || undefined;
        const color = parts[2] || undefined;

        // Variant increases the salesCount of the main product while reducing the stock
        await Product.updateOne(
          { _id: prodId, "variants.size": size, "variants.color": color },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
        await Product.updateOne(
          { _id: prodId },
          { $inc: { salesCount: item.quantity } } // Increases salesCount [2]
        );
      } else {
        // If it's a normal product, it decreases the Base Stock and increases the salesCount (done in a single query) [2]
        await Product.updateOne(
          { _id: item._id },
          { $inc: { stock: -item.quantity, salesCount: item.quantity } } // [2]
        );
      }
    }

    // 3. Automatic sending of EMAIL INVOICE
    try {
      await sendOrderEmail(newOrder);
    } catch (emailError) {
      console.error("Order Email failed to send:", emailError);
    }

    return NextResponse.json({ message: "Order placed successfully", orderId: newOrder._id }, { status: 201 });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}