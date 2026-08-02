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

    // 2. ⚡ ඇණවුම සාර්ථක වූ පසු Stock අඩු කර, Sales Count එක ඔටෝම වැඩි කිරීමේ Atomic Logic එක ⚡ [2]
    for (const item of items) {
      // Custom Gift Boxes වල IDs සෘජුව MongoDB ObjectIDs නොවන නිසා ඒවායේ stock/sales update එක skip කරයි
      if (item._id.startsWith("gift-box-") || item._id.startsWith("custom-gift-")) {
        continue;
      }

      // ප්‍රභේදයක් (Variant: Size + Color) මිලදී ගෙන තිබේ නම්
      if (item._id.includes("-")) {
        const parts = item._id.split("-");
        const prodId = parts[0];
        const size = parts[1] || undefined;
        const color = parts[2] || undefined;

        // Variant stock එක අඩු කරන අතරම, ප්‍රධාන product එකෙහි salesCount එක වැඩි කරයි
        await Product.updateOne(
          { _id: prodId, "variants.size": size, "variants.color": color },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
        await Product.updateOne(
          { _id: prodId },
          { $inc: { salesCount: item.quantity } } // salesCount එක වැඩි කරයි [2]
        );
      } else {
        // සාමාන්‍ය භාණ්ඩයක් නම් එහි Base Stock එක අඩු කර, salesCount එක වැඩි කරයි (තනි query එකකින් සිදු වේ) [2]
        await Product.updateOne(
          { _id: item._id },
          { $inc: { stock: -item.quantity, salesCount: item.quantity } } // [2]
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