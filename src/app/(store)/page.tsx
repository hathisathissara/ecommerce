// src/app/(store)/page.tsx
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Banner from "@/models/Banner";
import Review from "@/models/Review";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import NewsletterBox from "@/components/NewsletterBox";
import Link from "next/link";
import Image from "next/image"; // <-- Next.js Image import කළා [1]

export const revalidate = 10; // සෑම තත්පර 10කට වරක්ම දත්ත Cache එකෙන් Update කරයි

export default async function StoreHome() {
  await connectDB();
  
  // Database එකෙන් සියලුම Active Categories ලබාගැනීම (.limit(6) ඉවත් කර ඇත)
  const categories = await Category.find({ isActive: true }).sort({ createdAt: 1 });
  const activeBanners = await Banner.find({ isActive: true });

  // 1. 🛍️ New Arrivals: අලුතින්ම එකතු කළ අලුත්ම භාණ්ඩ 8ක් ලබාගැනීම
  const newArrivals = await Product.find()
    .populate("category", "name")
    .limit(8)
    .sort({ createdAt: -1 });

  // 2. ⚡ Flash Offers: වට්ටම් මිලක් (discountPrice > 0) ඇති භාණ්ඩ පමණක් ඔටෝම පෙරා ලබාගැනීම
  const flashOffers = await Product.find({ discountPrice: { $gt: 0 } })
    .populate("category", "name")
    .limit(4)
    .sort({ createdAt: -1 });

  // 3. 💬 Customer Reviews: තරු 4 හෝ 5 ලැබුණු අලුත්ම පණිවිඩ 3ක් ඔටෝම ලබාගැනීම
  const testimonials = await Review.find({ rating: { $gte: 4 } })
    .populate("product", "name")
    .limit(3)
    .sort({ createdAt: -1 });

  // Serialization (Next.js RSC-to-Client දත්ත සම්ප්‍රේෂණය සඳහා)
  const serializedNewArrivals = JSON.parse(JSON.stringify(newArrivals));
  const serializedFlashOffers = JSON.parse(JSON.stringify(flashOffers));
  const serializedBanners = JSON.parse(JSON.stringify(activeBanners));
  const serializedTestimonials = JSON.parse(JSON.stringify(testimonials));

  return (
    <div className="pb-0 bg-white">

      <HeroSlider banners={serializedBanners} />

      <div className="space-y-16 mt-10 sm:mt-16">
        

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 mb-6 uppercase">
            Shop by Category 📂
          </h2>
          

          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] snap-x">
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
                      fill // <-- Image එක exact size එකට expand වීමට [1]
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
          </div>
        </section>

        {/* ⚡ FLASH OFFERS SECTION ⚡ */}
        {serializedFlashOffers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl animate-pulse">⚡</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-red-600 uppercase">
                  Flash Offers / hot Deals
                </h2>
              </div>
              <Link href="/products" className="text-xs font-bold text-gray-400 hover:text-black hover:underline transition">
                View All Deals
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {serializedFlashOffers.map((prod: any) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* 🛍️ NEW ARRIVALS SECTION 🛍️ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 uppercase">
              New Arrivals ✨
            </h2>
            <Link href="/products" className="text-xs font-bold text-gray-400 hover:text-black hover:underline transition">
              Browse All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {serializedNewArrivals.map((prod: any) => (
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
              {serializedTestimonials.map((rev: any) => (
                <div key={rev._id} className="bg-gray-50/50 p-6 rounded-2xl border flex flex-col justify-between h-44 hover:shadow-sm transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">{rev.name}</span>
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