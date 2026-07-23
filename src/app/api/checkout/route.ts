// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product"; // <-- Product Model එක import කළා
import { sendOrderEmail } from "@/lib/email"; // <-- Email Utility එක import කළා

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

    // 1. Order එක Database එකේ සේව් කිරීම
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

    // 2. ⚡ ඇණවුම සාර්ථක වූ පසු ඔටෝම Stock ප්‍රමාණයන් අඩු කිරීමේ Logic එක (ඔබ සකසන ලද Bug-free ක්‍රමය) ⚡
    for (const item of items) {
      // Skip stock update for virtual custom gift boxes to prevent CastError
      if (item._id.startsWith("gift-box-") || item._id.startsWith("custom-gift-")) {
        continue;
      }

      // ප්‍රභේදයක් (Variant) මිලදී ගෙන තිබේ නම් (e.g. ID එකෙහි - සලකුණක් ඇත)
      if (item._id.includes("-")) {
        const [prodId, size] = item._id.split("-");
        
        // අදාළ Variant size එකට අදාළව තොග ප්‍රමාණය අඩු කරයි
        await Product.updateOne(
          { _id: prodId, "variants.size": size },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        // සාමාන්‍ය භාණ්ඩයක් නම් එහි Base Stock එකෙන් තොග ප්‍රමාණය අඩු කරයි
        await Product.updateOne(
          { _id: item._id },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // 3. ⚡ ස්වයංක්‍රීයව EMAIL INVOICE යැවීම ⚡
    try {
      await sendOrderEmail(newOrder);
    } catch (emailError) {
      // Email එක යැවීමේදී යම් ගැටලුවක් ආවොත් checkout එක හිරවෙන්නේ නැතුව සේව් වේ
      console.error("Order Email failed to send:", emailError);
    }

    return NextResponse.json({ message: "Order placed successfully", orderId: newOrder._id }, { status: 201 });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}