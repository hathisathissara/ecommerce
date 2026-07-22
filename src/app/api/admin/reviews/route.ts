// src/app/api/admin/reviews/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product"; // Product model එක register කිරීමට import කරගත යුතුය

// 1. සියලුම පාරිභෝගික අදහස් බලාගැනීම (GET)
export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find().populate("product", "name").sort({ createdAt: -1 });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// 2. නුසුදුසු අදහසක් Delete කිරීම (DELETE)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    await Review.findByIdAndDelete(reviewId);
    return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}