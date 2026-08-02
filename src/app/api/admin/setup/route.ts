// src/app/api/admin/setup/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    await connectDB();
    
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin already exists!" }, { status: 400 });
    }

    // 2. Default Password එක Hash කරනවා
    const hashedPassword = await bcrypt.hash("admin123", 10); 

    // 3. පළවෙනි Admin Account එක සේව් කරනවා
    await Admin.create({
      name: "Super Admin",
      email: "admin@store.com",
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Admin account created successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ message: "Error creating admin" }, { status: 500 });
  }
}