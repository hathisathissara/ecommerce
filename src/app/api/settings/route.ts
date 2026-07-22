// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";

export async function GET() {
  try {
    await connectDB();
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}