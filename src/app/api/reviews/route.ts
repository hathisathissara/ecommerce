// src/app/api/reviews/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

// 1. අදාළ Product ID එකට ලැබුණු සියලුම Reviews බලාගැනීම (GET)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// 2. අලුත් Review එකක් එකතු කිරීම (POST)
export async function POST(req: Request) {
  try {
    await connectDB();
    const { productId, name, rating, comment } = await req.json();

    if (!productId || !name || !rating || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newReview = await Review.create({
      product: productId,
      name,
      rating: Number(rating),
      comment,
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}