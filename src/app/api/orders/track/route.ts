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

    // Order ID එක MongoDB ObjectId එකක්දැයි පරීක්ෂා කිරීම (Server crash වීම් වැළැක්වීමට)
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid Order ID format" }, { status: 400 });
    }

    // දත්ත ලබාගැනීම (ආරක්ෂාව සඳහා ලිපිනයන් හැර නම, items සහ status පමණක් ලබාගනී)
    const order = await Order.findById(orderId).select(
      "customer.name status totalAmount createdAt items"
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Server error tracking order" }, { status: 500 });
  }
}