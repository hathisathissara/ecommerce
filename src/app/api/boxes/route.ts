import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Box from "@/models/Box";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const boxes = await Box.find().sort({ createdAt: -1 });
    return NextResponse.json(boxes, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch boxes:", error);
    return NextResponse.json({ error: "Failed to fetch boxes" }, { status: 500 });
  }
}
