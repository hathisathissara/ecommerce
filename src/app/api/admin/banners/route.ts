// src/app/api/admin/banners/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Banner from "@/models/Banner";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicIdFromUrl = (url: string) => {
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    const relativePath = parts[1].replace(/^v\d+\//, "");
    return relativePath.split(".")[0];
  } catch (err) {
    return null;
  }
};

// 1. GET - Fetch all banners
export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

// 2. POST - Create new banner
export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, subtitle, image, link } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Banner image is required" }, { status: 400 });
    }

    const newBanner = await Banner.create({
      title,
      subtitle,
      image,
      link: link || undefined,
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}

// 3. PUT - Update banner
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { bannerId, title, subtitle, image, link } = await req.json();

    if (!bannerId || !image) {
      return NextResponse.json({ error: "Banner ID and image are required" }, { status: 400 });
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      { title, subtitle, image, link },
      { new: true }
    );

    return NextResponse.json(updatedBanner, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

// 4. DELETE - Delete banner (Includes Cloudinary image cleanup)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const bannerId = searchParams.get("id");

    if (!bannerId) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    const publicId = getPublicIdFromUrl(banner.image);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete from DB
    await Banner.findByIdAndDelete(bannerId);
    return NextResponse.json({ message: "Banner and image deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}