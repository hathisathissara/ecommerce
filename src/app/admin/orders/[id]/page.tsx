// src/app/admin/orders/[id]/page.tsx
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Setting from "@/models/Setting";
import { notFound } from "next/navigation";
import OrderDetailsClient from "./OrderDetailsClient";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectDB();
  const order = await Order.findById(id);
  if (!order) {
    notFound();
  }

  const settings = await Setting.findOne();

  // Serialization (Mongoose Objects සරල JSON බවට පත් කිරීම)
  const serializedOrder = JSON.parse(JSON.stringify(order));
  const serializedSettings = JSON.parse(JSON.stringify(settings));

  return (
    <OrderDetailsClient 
      order={serializedOrder} 
      settings={serializedSettings} 
    />
  );
}