// src/app/api/coupons/validate/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order"; // <-- Imported the Order Model

export async function POST(req: Request) {
  try {
    await connectDB();
    const { code, totalAmount, email } = await req.json(); // <-- also retrieves email data

    if (!code || !totalAmount) {
      return NextResponse.json({ error: "Code and amount are required" }, { status: 400 });
    }

    // 1. Checking the coupon code
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // 2. 🛡️ ONE-TIME USE SECURITY CHECK 🛡️
    // If the customer's email is received, it will check if he has already used this coupon
    if (email) {
      const alreadyUsed = await Order.findOne({
        "customer.email": email.toLowerCase().trim(),
        couponCode: coupon.code,
      });

      if (alreadyUsed) {
        return NextResponse.json({ error: "You have already used this coupon code once!" }, { status: 400 });
      }
    }

    // 3. Check if the minimum billing value is met
    if (totalAmount < coupon.minOrderAmount) {
      return NextResponse.json({ error: `This coupon requires a minimum spend of LKR ${coupon.minOrderAmount}` }, { status: 400 });
    }

    // 4. Calculation of discount amount
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