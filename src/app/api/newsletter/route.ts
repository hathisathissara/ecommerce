// src/app/api/newsletter/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    // Checking if the format of an email is correct (Email Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // Check if this email has already been saved
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
      return NextResponse.json({ error: "You are already subscribed! 😊" }, { status: 400 });
    }

    await Newsletter.create({ email: email.toLowerCase() });
    return NextResponse.json({ message: "Subscribed successfully!" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}