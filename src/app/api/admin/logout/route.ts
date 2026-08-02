import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Next.js 15 cookies need to await
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");

  return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}