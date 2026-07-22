// src/app/api/admin/brands/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Brand from "@/models/Brand";
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

// 1. GET - Fetch all brands
export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find().sort({ createdAt: -1 });
    return NextResponse.json(brands, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

// 2. POST - Create new brand
export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, image } = await req.json();

    if (!name || !image) {
      return NextResponse.json({ error: "Name and image are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newBrand = await Brand.create({ name, slug, image });
    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

// 3. PUT - Update brand
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { brandId, name, image } = await req.json();

    if (!brandId || !name || !image) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { name, slug, image },
      { new: true }
    );

    return NextResponse.json(updatedBrand, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

// 4. DELETE - Delete brand
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("id");

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    const publicId = getPublicIdFromUrl(brand.image);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await Brand.findByIdAndDelete(brandId);
    return NextResponse.json({ message: "Brand and image deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}