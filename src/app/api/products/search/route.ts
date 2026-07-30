import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 1) {
      return NextResponse.json({ products: [], categories: [] });
    }

    // Search products by name or description
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
      .select("name slug price discountPrice images")
      .limit(6)
      .sort({ createdAt: -1 });

    // Search categories by name
    const categories = await Category.find({
      isActive: true,
      name: { $regex: q, $options: "i" },
    })
      .select("name slug")
      .limit(5);

    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedCategories = JSON.parse(JSON.stringify(categories));

    return NextResponse.json({
      products: serializedProducts,
      categories: serializedCategories,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
