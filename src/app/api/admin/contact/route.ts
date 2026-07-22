// src/app/api/admin/contact/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

export async function GET() {
  try {
    await connectDB();
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json(inquiries, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const inquiryId = searchParams.get("id");

    if (!inquiryId) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    await Contact.findByIdAndDelete(inquiryId);
    return NextResponse.json({ message: "Inquiry deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}