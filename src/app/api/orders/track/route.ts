// src/app/api/orders/track/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Checking if the Order ID is a MongoDB ObjectId (to prevent server crashes)
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid Order ID format" }, { status: 400 });
    }

    // Retrieving all fields needed for the invoice receipt on the success page
    const order = await Order.findById(orderId).select(
      "customer status items paymentMethod paymentStatus orderNumber invoiceNumber " +
      "subtotal totalProductDiscount coupon couponDiscount shippingFee tax grandTotal " +
      "totalAmount couponCode discountAmount createdAt"
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Server error tracking order" }, { status: 500 });
  }
}