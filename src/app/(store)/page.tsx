// src/app/(store)/page.tsx
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Banner from "@/models/Banner";
import Review from "@/models/Review";
import Brand from "@/models/Brand"; // Import Brand model
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import NewsletterBox from "@/components/NewsletterBox";
import DragScroll from "@/components/DragScroll";
import Link from "next/link";
import Image from "next/image";

import Setting from "@/models/Setting";
import type { Metadata } from "next";

export const revalidate = 10; // Revalidate dynamic cache data every 10 seconds

export async function generateMetadata(): Promise<Metadata> {
  await connectDB();
  const settings = await Setting.findOne();
  const activeBanner = await Banner.findOne({ isActive: true });

  const siteTitle = settings?.storeName || "The Store";
  const defaultDesc = "Explore our premium collection of imported luxury perfumes, cosmetics, and custom gift boxes in Sri Lanka.";
  
  // Use the first active banner image as the OG Image, or fallback to logo
  const ogImage = activeBanner?.image || settings?.logo || "/og-image.png";

  return {
    title: `${siteTitle} | Home`,
    description: defaultDesc,
    openGraph: {
      title: `${siteTitle} | Luxury Perfumes & Cosmetics`,
      description: defaultDesc,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function StoreHome() {
  await connectDB();
  
  // Fetch active store categories and banners from database
  const categories = await Category.find({ isActive: true }).sort({ createdAt: 1 });
  const activeBanners = await Banner.find({ isActive: true });

  // Fetch active store brands from database
  const brands = await Brand.find().sort({ name: 1 });

  // 1. New Arrivals: Fetch 8 most recently added products
  const newArrivals = await Product.find()
    .populate("category", "name")
    .limit(8)
    .sort({ createdAt: -1 });

  // 2. Flash Offers: Fetch top 4 products that have active discount prices
  const flashOffers = await Product.find({ discountPrice: { $gt: 0 } })
    .populate("category", "name")
    .limit(4)
    .sort({ createdAt: -1 });

  // 3. Best Sellers: Fetch top 4 products sorted by highest lifetime sales count
  const bestSellers = await Product.find({})
    .populate("category", "name")
    .limit(4)
    .sort({ salesCount: -1 });

  // 4. Customer Reviews: Fetch top 3 latest reviews with a rating of 4 stars or higher
  const testimonials = await Review.find({ rating: { $gte: 4 } })
    .populate("product", "name")
    .limit(3)
    .sort({ createdAt: -1 });

  // Serialize Mongoose Documents for Client Components serialization safety
  const serializedNewArrivals = JSON.parse(JSON.stringify(newArrivals));
  const serializedFlashOffers = JSON.parse(JSON.stringify(flashOffers));
  const serializedBestSellers = JSON.parse(JSON.stringify(bestSellers));
  const serializedBanners = JSON.parse(JSON.stringify(activeBanners));
  const serializedTestimonials = JSON.parse(JSON.stringify(testimonials));
  const serializedBrands = JSON.parse(JSON.stringify(brands));

  return (
    <div className="pb-0 bg-white">
      {/* Dynamic Hero Slider */}
      <HeroSlider banners={serializedBanners} />

      <div className="space-y-16 mt-10 sm:mt-16">
        
        {/* Category horizontal scroll row */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 mb-6 uppercase">
            Shop by Category 📂
          </h2>
          
          <DragScroll>
            {categories.map((cat) => (
              <Link
                href={`/products?category=${cat.slug}`}
                key={cat._id.toString()}
                className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center group snap-start"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center hover:bg-gray-100 hover:border-gray-200 transition duration-200 overflow-hidden relative">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                </div>
                <span className="mt-2 font-bold text-[10px] sm:text-xs text-gray-800 text-center line-clamp-1 w-full">
                  {cat.name}
                </span>
              </Link>
            ))}
          </DragScroll>
        </section>

        {/* ⚡ FEATURED BRANDS HORIZONTAL SCROLL ROW ⚡ */}
        {serializedBrands.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 mb-6 uppercase">
              Featured Brands 🏷️
            </h2>
            
            {/* Horizontal scrollable brands container */}
            <DragScroll>
              {serializedBrands.map((brand: { _id: string; slug: string; name: string; image: string }) => (
                <Link
                  href={`/products?brand=${brand.slug}`}
                  key={brand._id}
                  className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center group snap-start"
                >
                  {/* Outer rounded card */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center hover:bg-gray-100 hover:border-gray-200 transition duration-200 overflow-hidden relative">
                    {/* Inner image container with padding to fit brand logos neatly */}
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white p-1">
                      <Image
                        src={brand.image}
                        alt={brand.name}
                        fill
                        unoptimized
                        className="object-contain group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  </div>
                  <span className="mt-2 font-bold text-[10px] sm:text-xs text-gray-800 text-center line-clamp-1 w-full">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </DragScroll>
          </section>
        )}

        {/* FLASH OFFERS SECTION */}
        {serializedFlashOffers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl animate-pulse">⚡</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-red-600 uppercase">
                  Flash Offers / hot Deals
                </h2>
              </div>
              <Link href="/products?filter=flash-deals" className="text-xs font-bold text-gray-400 hover:text-black hover:underline transition">
                View All Deals
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {serializedFlashOffers.map((prod: { _id: string; name: string; slug: string; price: number; discountPrice?: number; images: string[]; category?: { name: string } }) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* BEST SELLERS SECTION */}
        {serializedBestSellers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">🏆</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 uppercase">
                  Best Sellers
                </h2>
              </div>
              <Link href="/products?sort=best-selling" className="text-xs font-bold text-gray-400 hover:text-black hover:underline transition">
                Browse Best Sellers
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {serializedBestSellers.map((prod: { _id: string; name: string; slug: string; price: number; discountPrice?: number; images: string[]; category?: { name: string } }) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* NEW ARRIVALS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 uppercase">
              New Arrivals ✨
            </h2>
            <Link href="/products?sort=newest" className="text-xs font-bold text-gray-400 hover:text-black hover:underline transition">
              Browse All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {serializedNewArrivals.map((prod: { _id: string; name: string; slug: string; price: number; discountPrice?: number; images: string[]; category?: { name: string } }) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>

        {/* Testimonials */}
        {serializedTestimonials.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-100 pt-16">
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 uppercase">
                What Our Customers Say 💬
              </h2>
              <p className="text-xs text-gray-400 mt-1">Real reviews from verified fragrance and cosmetic lovers.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serializedTestimonials.map((rev: { _id: string; name: string; rating: number; comment: string; createdAt: string; product?: { name: string } }) => (
                <div key={rev._id} className="bg-gray-50/50 p-6 rounded-2xl border flex flex-col justify-between h-44 hover:shadow-sm transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-800">{rev.name}</span>
                      <span className="text-xs text-yellow-500">{"★".repeat(rev.rating)}</span>
                    </div>
                    {rev.product && (
                      <span className="inline-block text-[9px] bg-gray-900/5 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">
                        on {rev.product.name}
                      </span>
                    )}
                    <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-3">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-300 block text-right">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter Box */}
        <NewsletterBox />
      </div>
    </div>
  );
}