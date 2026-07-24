// src/app/api/newsletter/unsubscribe/route.ts
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

    // Email එක සොයාගෙන Database එකෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීම
    const deletedSubscriber = await Newsletter.findOneAndDelete({
      email: email.toLowerCase().trim(),
    });

    if (!deletedSubscriber) {
      return NextResponse.json(
        { error: "This email address is not found in our subscriber list." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Unsubscribed successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}