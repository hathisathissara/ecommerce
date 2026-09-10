import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("admin_access_pass");

  return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}