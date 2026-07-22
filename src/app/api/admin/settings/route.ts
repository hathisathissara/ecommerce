// src/app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import { v2 as cloudinary } from "cloudinary"; // <-- Cloudinary import කළා

// Cloudinary Configuration එක
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// URL එකකින් Cloudinary Public ID එක වෙන් කරගන්නා Helper Function එක
const getPublicIdFromUrl = (url: string) => {
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    const relativePath = parts[1].replace(/^v\d+\//, "");
    return relativePath.split(".")[0];
  } catch {
    return null;
  }
};

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

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { logo } = body; // අලුතින් ලැබෙන Logo URL එක

    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create(body);
    } else {
      // ⚡ CLOUDINARY LOGO CLEANUP LOGIC ⚡
      // අලුතින් Logo එකක් ලැබී තිබේ නම් සහ එය කලින් තිබුණු Logo එකට වඩා වෙනස් නම් පමණක් පරණ එක මකා දමයි
      if (logo && settings.logo && settings.logo !== logo) {
        const oldPublicId = getPublicIdFromUrl(settings.logo);
        if (oldPublicId) {
          await cloudinary.uploader.destroy(oldPublicId); // පරණ Logo එක Cloudinary එකෙන් ඩිලීට් වේ
        }
      }

      settings = await Setting.findByIdAndUpdate(settings._id, body, { returnDocument: "after" });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}