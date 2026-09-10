import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // 1. Secret Access Protection: Verify client passed the secret admin check
    const cookieStore = await cookies();
    const adminSecret = process.env.ADMIN_SECRET_KEY;
    if (adminSecret) {
      const accessPass = cookieStore.get("admin_access_pass")?.value;
      if (accessPass !== adminSecret) {
        return NextResponse.json({ message: "Access forbidden" }, { status: 403 });
      }
    }

    // 2. Brute-Force Rate Limiting (5 attempts per IP per 15 minutes)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const rateLimit = checkLoginRateLimit(ip, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message: `Too many failed attempts. Access blocked. Please try again in ${rateLimit.resetInMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    await connectDB();
    const { email, password } = await req.json();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        {
          message: `Invalid credentials. (${rateLimit.remaining} attempts remaining)`,
        },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          message: `Invalid credentials. (${rateLimit.remaining} attempts remaining)`,
        },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    resetLoginRateLimit(ip);

    // Creating the JWT Token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}