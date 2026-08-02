// src/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// 1. View All Orders (GET)
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }); // Newest ones are shown first
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// 2. Changing the Status of an Order (PUT)
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // To return the updated new order
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order status updated successfully", order: updatedOrder }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}