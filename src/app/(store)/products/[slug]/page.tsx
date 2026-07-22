// src/app/(store)/products/[slug]/page.tsx
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Brand";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import type { Metadata } from "next"; // <-- Metadata Type එක import කළා

// ⚡ SEO සඳහා DYNAMIC METADATA GENERATOR (Next.js 15) ⚡
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // Next.js 15 වල params await කළ යුතුය

  await connectDB();
  const product = await Product.findOne({ slug });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  // Google සෙවුම් සඳහා Description එක අකුරු 160කට සීමා කිරීම (Best practice)
  const shortDescription = product.description.substring(0, 160) + "...";

  return {
    title: product.name, // Browser Tab එකේ Product එකේ නම පෙන්වයි
    description: shortDescription,
    
    // මෙම Product ලින්ක් එක WhatsApp/Facebook Share කරද්දී පින්තූරය සමඟ ලස්සනට පෙන්වීමට
    openGraph: {
      title: `${product.name} | The Store`,
      description: shortDescription,
      images: [
        {
          url: product.images[0], // Product එකේ පළමු පින්තූරය Share preview එකට ඔටෝම වැටේ!
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
  const product = await Product.findOne({ slug })
    .populate("category", "name")
    .populate("brand", "name");

  if (!product) {
    notFound();
  }

  const serializedProduct = JSON.parse(JSON.stringify(product));

  return <ProductDetailsClient key={serializedProduct._id} product={serializedProduct} />;
}