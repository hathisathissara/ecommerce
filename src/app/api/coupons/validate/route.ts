// src/app/api/coupons/validate/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order"; // <-- Order Model එක import කළා

export async function POST(req: Request) {
  try {
    await connectDB();
    const { code, totalAmount, email } = await req.json(); // <-- email දත්තයද ලබාගනී

    if (!code || !totalAmount) {
      return NextResponse.json({ error: "Code and amount are required" }, { status: 400 });
    }

    // 1. කූපන් කෝඩ් එක පරීක්ෂා කිරීම
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // 2. 🛡️ ONE-TIME USE SECURITY CHECK 🛡️
    // පාරිභෝගිකයාගේ Email එක ලැබී තිබේ නම්, ඔහු දැනටමත් මෙම කූපන් එක භාවිත කර ඇත්දැයි බලයි
    if (email) {
      const alreadyUsed = await Order.findOne({
        "customer.email": email.toLowerCase().trim(),
        couponCode: coupon.code,
      });

      if (alreadyUsed) {
        return NextResponse.json({ error: "You have already used this coupon code once!" }, { status: 400 });
      }
    }

    // 3. අවම බිල්පත් අගය සපුරා තිබේදැයි බැලීම
    if (totalAmount < coupon.minOrderAmount) {
      return NextResponse.json({ error: `This coupon requires a minimum spend of LKR ${coupon.minOrderAmount}` }, { status: 400 });
    }

    // 4. වට්ටම් මුදල ගණනය කිරීම
    let discountAmount = 0;
    if (coupon.discountType === "Percentage") {
      discountAmount = Math.round((totalAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Server error validating coupon" }, { status: 500 });
  }
}