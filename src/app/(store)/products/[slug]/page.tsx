// src/app/(store)/products/[slug]/page.tsx
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import type { Metadata } from "next";

// SEO සඳහා Dynamic Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  await connectDB();
  const product = await Product.findOne({ slug });

  if (!product) {
    return { title: "Product Not Found" };
  }

  const shortDescription = product.shortDescription || product.description.substring(0, 160) + "...";

  return {
    title: product.name,
    description: shortDescription,
    openGraph: {
      title: `${product.name} | The Store`,
      description: shortDescription,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
        },
      ],
    },
  };
}

// Main Page Render Component
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectDB();
  
  // 1. ප්‍රධාන Product එක ලබාගැනීම
  const product = await Product.findOne({ slug })
    .populate("category", "name")
    .populate("brand", "name");

  if (!product) {
    notFound();
  }

  // 2. ⚡ අදාළ Category එකේම තියෙන වෙනත් භාණ්ඩ 4ක් ලබාගැනීම (Related Products) ⚡
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id } // වත්මන් භාණ්ඩය මඟහරියි
  })
  .populate("category", "name")
  .populate("brand", "name")
  .limit(4);

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductDetailsClient 
      product={serializedProduct} 
      relatedProducts={serializedRelated} // Related products දත්ත යවයි
    />
  );
}