// src/app/api/admin/boxes/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Box from "@/models/Box";
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

// 1. GET - Fetch all boxes
export async function GET() {
  try {
    await connectDB();
    const boxes = await Box.find().sort({ createdAt: -1 });
    return NextResponse.json(boxes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch boxes" }, { status: 500 });
  }
}

// 2. POST - Create new box style with Description
export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, description, price, image } = await req.json(); // <-- description ලබාගනී

    if (!name || !description || !price || !image) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newBox = await Box.create({ 
      name, 
      description, // <-- Database සේව් වීම
      price: Number(price), 
      image 
    });
    return NextResponse.json(newBox, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create box style" }, { status: 500 });
  }
}

// 3. PUT - Update box style with Description
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { boxId, name, description, price, image } = await req.json(); // <-- description ලබාගනී

    if (!boxId || !name || !description || !price || !image) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const updatedBox = await Box.findByIdAndUpdate(
      boxId,
      { 
        name, 
        description, // <-- Database යාවත්කාලීන වීම
        price: Number(price), 
        image 
      },
      { new: true }
    );

    return NextResponse.json(updatedBox, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update box style" }, { status: 500 });
  }
}

// 4. DELETE - Delete box style & Cloudinary Image
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const boxId = searchParams.get("id");

    if (!boxId) {
      return NextResponse.json({ error: "Box ID is required" }, { status: 400 });
    }

    const box = await Box.findById(boxId);
    if (!box) {
      return NextResponse.json({ error: "Box style not found" }, { status: 404 });
    }

    const publicId = getPublicIdFromUrl(box.image);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await Box.findByIdAndDelete(boxId);
    return NextResponse.json({ message: "Box style and image deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete box style" }, { status: 500 });
  }
}