// src/app/api/coupons/validate/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { code, totalAmount } = await req.json();

    if (!code || !totalAmount) {
      return NextResponse.json({ error: "Code and amount are required" }, { status: 400 });
    }

    // 1. Searching the coupon code from the database
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // 2. To see if the minimum billing value is met
    if (totalAmount < coupon.minOrderAmount) {
      return NextResponse.json({ error: `This coupon requires a minimum spend of LKR ${coupon.minOrderAmount}` }, { status: 400 });
    }

    // 3. Calculation of Discount Amount
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