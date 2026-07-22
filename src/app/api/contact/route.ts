// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newInquiry = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json({ message: "Inquiry submitted successfully", inquiry: newInquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}