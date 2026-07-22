// src/app/api/admin/newsletter/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";

// 1. GET - Fetch all subscribers
export async function GET() {
  try {
    await connectDB();
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

// 2. DELETE - Remove/Unsubscribe a user (DELETE)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const subId = searchParams.get("id");

    if (!subId) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    await Newsletter.findByIdAndDelete(subId);
    return NextResponse.json({ message: "Subscriber removed successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}