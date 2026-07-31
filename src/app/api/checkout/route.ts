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

    // 1. 🛡️ BACKEND DOUBLE-CHECK: කූපන් කෝඩ් එක දැනටමත් මෙම Email එකෙන් භාවිත කර තිබේදැයි බලයි
    if (couponCode) {
      const alreadyUsed = await Order.findOne({
        "customer.email": customer.email.toLowerCase().trim(),
        couponCode: couponCode.toUpperCase()
      });
      if (alreadyUsed) {
        return NextResponse.json({ error: "This coupon code has already been used by this email address!" }, { status: 400 });
      }
    }

    // Order එක Database එකේ සේව් කිරීම
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

    // 2. ඇණවුම සාර්ථක වූ පසු ඔටෝම Stock ප්‍රමාණයන් අඩු කිරීම
    for (const item of items) {
      if (item._id.startsWith("gift-box-") || item._id.startsWith("custom-gift-")) {
        continue;
      }
      if (item._id.includes("-")) {
        const parts = item._id.split("-");
        const prodId = parts[0];
        const size = parts[1] || undefined;
        const color = parts[2] || undefined;

        await Product.updateOne(
          { _id: prodId, "variants.size": size, "variants.color": color },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        await Product.updateOne(
          { _id: item._id },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // 3. ස්වයංක්‍රීයව EMAIL INVOICE යැවීම
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