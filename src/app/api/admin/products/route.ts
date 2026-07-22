// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
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

// 1. GET - Fetch all products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// 2. POST - Create new product with SKU
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, sku, description, price, discountPrice, stock, images, category, brand, isGiftItem, variants } = body; // <-- sku එකතු කළා

    if (!name || !description || !price || !images || images.length === 0 || !category || !stock) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newProduct = await Product.create({
      name,
      slug,
      sku: sku || undefined, // Base SKU සේව් වීම
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock),
      images,
      category,
      brand: brand || undefined,
      isGiftItem: Boolean(isGiftItem),
      variants: variants || [],
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Product Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// 3. PUT - Update product with SKU
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { productId, name, sku, description, price, discountPrice, stock, images, category, brand, isGiftItem, variants } = body; // <-- sku එකතු කළා

    if (!productId || !name || !description || !price || !category || !stock) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        slug,
        sku: sku || undefined, // Base SKU යාවත්කාලීන වීම
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stock: Number(stock),
        images,
        category,
        brand: brand || undefined,
        isGiftItem: Boolean(isGiftItem),
        variants: variants || [],
      },
      { new: true }
    );

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// 4. DELETE - Delete product and Cloudinary images
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    for (const imageUrl of product.images) {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Product.findByIdAndDelete(productId);
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}