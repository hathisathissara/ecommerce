// src/app/(store)/page.tsx
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Banner from "@/models/Banner";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import NewsletterBox from "@/components/NewsletterBox";
import Link from "next/link";
import Image from "next/image"; // <-- Next.js Image import කළා [1]

export const revalidate = 10; // සෑම තත්පර 10කට වරක්ම දත්ත Cache එකෙන් Update කරයි

export default async function StoreHome() {
  await connectDB();
  
  // Database එකෙන් දත්ත ලබාගැනීම
  const categories = await Category.find({ isActive: true }).limit(6);
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

  // Serialization (Next.js RSC-to-Client දත්ත සම්ප්‍රේෂණය සඳහා)
  const serializedNewArrivals = JSON.parse(JSON.stringify(newArrivals));
  const serializedFlashOffers = JSON.parse(JSON.stringify(flashOffers));
  const serializedBanners = JSON.parse(JSON.stringify(activeBanners));

  return (
    <div className="pb-0 bg-white">
      {/* Dynamic Hero Slider */}
      <HeroSlider banners={serializedBanners} />

      <div className="space-y-16 mt-10 sm:mt-16">
        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 mb-6 uppercase">
            Shop by Category 📂
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link href={`/products?category=${cat.slug}`} key={cat._id.toString()} className="group">
                <div className="border rounded-2xl p-4 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition duration-200">
                  {/* ⚡ HTML <img> වෙනුවට Next.js <Image /> සාර්ථකව ආදේශ කර ඇත ⚡ */}
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={80} // w-20 යනු 80px වේ
                    height={80} // h-20 යනු 80px වේ
                    unoptimized // Vercel image billing බේරා ගැනීමට
                    className="object-cover rounded-full group-hover:scale-105 transition duration-300"
                  />
                  <span className="mt-3 font-bold text-sm text-gray-800">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ⚡ FLASH OFFERS SECTION (වට්ටම් සහිත භාණ්ඩ පමණක් පෙන්වයි) ⚡ */}
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

        {/* 🛍️ NEW ARRIVALS SECTION (අලුත්ම භාණ්ඩ පමණක් පෙන්වයි) 🛍️ */}
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

        {/* Newsletter Box */}
        <NewsletterBox />
      </div>
    </div>
  );
}