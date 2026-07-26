// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
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

// වට්ටම් මිල ගණනය කරන පොදු Helper එක (Percentage vs Fixed)
const calculateDiscountPrice = (price: number, val: number, type: string) => {
  if (!val || val <= 0) return null;
  if (type === "Percentage") {
    return Math.round(price - (price * val) / 100);
  }
  return price - val;
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

// 2. POST - Create new product
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { 
      name, sku, shortDescription, description, category, subCategory, brand, tags,
      price, discountValue, discountType, tax,
      stock, lowStockAlert, stockStatus, barcode, trackInventory,
      variants, images, isGiftItem 
    } = body;

    if (!name || !description || !price || !images || images.length === 0 || !category || stock === undefined) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Base discount price ගණනය කිරීම
    const baseDiscountPrice = calculateDiscountPrice(Number(price), Number(discountValue), discountType);

    const newProduct = await Product.create({
      name,
      slug,
      sku: sku || undefined,
      shortDescription,
      description,
      category,
      subCategory: subCategory || undefined,
      brand: (brand && brand !== "") ? brand : null,
      tags: tags || [],
      price: Number(price),
      discountValue: Number(discountValue),
      discountType,
      discountPrice: baseDiscountPrice,
      tax: tax ? Number(tax) : 0,
      stock: Number(stock),
      lowStockAlert: lowStockAlert ? Number(lowStockAlert) : 5,
      stockStatus,
      barcode: barcode || undefined,
      trackInventory: Boolean(trackInventory),
      isGiftItem: Boolean(isGiftItem),
      images,
      // Variants වල Discount pricesද ඔටෝම ගණනය කර සේව් කරයි
      variants: (variants || []).map((v: any) => ({
        size: v.size || undefined,
        color: v.color || undefined,
        price: Number(v.price),
        discountValue: Number(v.discountValue || 0),
        discountType: v.discountType || "Percentage",
        discountPrice: calculateDiscountPrice(Number(v.price), Number(v.discountValue), v.discountType || "Percentage"),
        stock: Number(v.stock || 0),
        sku: v.sku || undefined
      })),
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Product Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// 3. PUT - Update product
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { 
      productId, name, sku, shortDescription, description, category, subCategory, brand, tags,
      price, discountValue, discountType, tax,
      stock, lowStockAlert, stockStatus, barcode, trackInventory,
      variants, images, isGiftItem 
    } = body;

    if (!productId || !name || !description || !price || !category || stock === undefined) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Delete removed images from Cloudinary
    const oldImages = product.images || [];
    const imagesToDelete = oldImages.filter((img: string) => !images.includes(img));
    if (imagesToDelete.length > 0) {
      try {
        for (const imageUrl of imagesToDelete) {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary Delete Error on Update:", cloudinaryError);
      }
    }

    // Base discount price ගණනය කිරීම
    const baseDiscountPrice = calculateDiscountPrice(Number(price), Number(discountValue), discountType);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        slug,
        sku: sku || undefined,
        shortDescription,
        description,
        category,
        subCategory: subCategory || undefined,
        brand: (brand && brand !== "") ? brand : null,
        tags: tags || [],
        price: Number(price),
        discountValue: Number(discountValue),
        discountType,
        discountPrice: baseDiscountPrice,
        tax: tax ? Number(tax) : 0,
        stock: Number(stock),
        lowStockAlert: lowStockAlert ? Number(lowStockAlert) : 5,
        stockStatus,
        barcode: barcode || undefined,
        trackInventory: Boolean(trackInventory),
        isGiftItem: Boolean(isGiftItem),
        images,
        variants: (variants || []).map((v: any) => ({
          size: v.size || undefined,
          color: v.color || undefined,
          price: Number(v.price),
          discountValue: Number(v.discountValue || 0),
          discountType: v.discountType || "Percentage",
          discountPrice: calculateDiscountPrice(Number(v.price), Number(v.discountValue), v.discountType || "Percentage"),
          stock: Number(v.stock || 0),
          sku: v.sku || undefined
        })),
      },
      { new: true }
    );

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// 4. DELETE - Delete product
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const productId = req.nextUrl.searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      for (const imageUrl of product.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary Delete Error:", cloudinaryError);
    }

    await Product.findByIdAndDelete(productId);
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}