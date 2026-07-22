// src/app/(store)/page.tsx
import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Banner from "@/models/Banner";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import NewsletterBox from "@/components/NewsletterBox";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 10;

// WhatsApp/FB crawler එකට public/ folder static image එකක් නෙමෙයි,
// ඔයාගේ API/DB එකෙන් එන real banner/product image එක OG image විදිහට දෙනවා
export async function generateMetadata(): Promise<Metadata> {
  await connectDB();

  // 1st priority: active banner එකක image, 2nd priority: latest product image
  const banner = await Banner.findOne({ isActive: true });
  const fallbackProduct = banner ? null : await Product.findOne().sort({ createdAt: -1 });

  const ogImageUrl =
    banner?.image || fallbackProduct?.images?.[0] || "/og-image.jpg"; // default fallback

  return {
    openGraph: {
      images: [
        {
          url: ogImageUrl, // absolute URL එකක් නම් (https://res.cloudinary.com/... වගේ) කෙලින්ම වැඩ කරයි
          width: 1200,
          height: 630,
          alt: "The Store | Luxury Perfumes & Cosmetics",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImageUrl],
    },
  };
}

export default async function StoreHome() {
  await connectDB();

  const categories = await Category.find({ isActive: true }).limit(6);
  const featuredProducts = await Product.find().populate("category", "name").limit(8).sort({ createdAt: -1 });
  const activeBanners = await Banner.find({ isActive: true });

  const serializedProducts = JSON.parse(JSON.stringify(featuredProducts));
  const serializedBanners = JSON.parse(JSON.stringify(activeBanners));

  return (
    <div className="bg-white">
      {/* 1. Hero Slider */}
      <HeroSlider banners={serializedBanners} />

      {/* 2. Trust Badges */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: "🚚", title: "Free Shipping", sub: "On orders over LKR 5,000" },
              { icon: "✅", title: "Authentic Products", sub: "100% genuine imports" },
              { icon: "🔄", title: "Easy Returns", sub: "Within 7 days" },
              { icon: "🔒", title: "Secure Checkout", sub: "Your data is safe" },
            ].map((badge) => (
              <div key={badge.title} className="flex flex-col items-center gap-1.5 py-2">
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-xs font-bold text-gray-900">{badge.title}</p>
                <p className="text-[10px] text-gray-500 hidden sm:block">{badge.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Browse by</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Categories</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition flex items-center gap-1">
              View All <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                href={`/products?category=${cat.slug}`}
                key={cat._id.toString()}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 group-hover:border-gray-300 group-hover:shadow-md transition-all duration-300">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={160}
                    height={160}
                    unoptimized
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-gray-100" />
      </div>

      {/* 4. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Hand-Picked</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Featured Products</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition flex items-center gap-1">
            Shop All <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {serializedProducts.map(
            (prod: { _id: string; name: string; slug: string; price: number; discountPrice?: number; images: string[]; category?: { name: string } }) => (
              <ProductCard key={prod._id} product={prod} />
            )
          )}
        </div>
      </section>

      {/* 5. Gift Builder Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <Link
          href="/gift-builder"
          className="group relative flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-900 text-white rounded-3xl px-8 py-10 sm:px-12 overflow-hidden hover:bg-gray-800 transition-colors duration-300"
        >
          {/* Background glow */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-300 via-transparent to-transparent pointer-events-none" />

          <div className="relative text-center sm:text-left">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Exclusive Feature</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Build Your Own Gift Box 🎁</h2>
            <p className="mt-2 text-sm text-gray-400 max-w-md">
              Curate a personalized gift set for your loved ones. Choose from our premium products and create a custom box.
            </p>
          </div>

          <div className="relative flex-shrink-0">
            <span className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-6 py-3 rounded-xl group-hover:bg-gray-100 transition">
              Start Building <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </Link>
      </section>

      {/* 6. Newsletter */}
      <NewsletterBox />
    </div>
  );
}