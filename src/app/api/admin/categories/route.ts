// src/app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
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

// 1. GET - Fetch all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// 2. POST - Create new category
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

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    const newCategory = await Category.create({ name, slug, image });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// 3. PUT - Update category
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { categoryId, name, image } = await req.json();

    if (!categoryId || !name || !image) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, slug, image },
      { new: true }
    );

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// 4. DELETE - Delete category (Includes Cloudinary image cleanup)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    const publicId = getPublicIdFromUrl(category.image);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete from DB
    await Category.findByIdAndDelete(categoryId);
    return NextResponse.json({ message: "Category and image deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}