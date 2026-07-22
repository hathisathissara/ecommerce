// src/app/api/admin/coupons/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

// 1. GET - Fetch all coupons
export async function GET() {
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// 2. POST - Create new coupon
export async function POST(req: Request) {
  try {
    await connectDB();
    const { code, discountType, discountValue, minOrderAmount } = await req.json();

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

// 3. PUT - Update coupon status / details
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { couponId, code, discountType, discountValue, minOrderAmount, isActive } = await req.json();

    if (!couponId || !code || !discountType || !discountValue) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        code,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        isActive: Boolean(isActive),
      },
      { new: true }
    );

    return NextResponse.json(updatedCoupon, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// 4. DELETE - Delete coupon
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const couponId = searchParams.get("id");

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await Coupon.findByIdAndDelete(couponId);
    return NextResponse.json({ message: "Coupon deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}