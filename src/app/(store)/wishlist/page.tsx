// src/app/(store)/wishlist/page.tsx
"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-medium text-gray-400 animate-pulse">Loading Wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl mb-6">
          🤍
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 mb-8 max-w-sm leading-relaxed">
          Explore our collection and add your favorite luxury perfumes or cosmetics here.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-700 transition"
        >
          Browse Products <span>→</span>
        </Link>
      </div>
    );
  }

  const handleMoveToCart = (item: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
  }) => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice,
      image: item.image,
    });
    toggleWishlist(item);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Wishlist</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            My Wishlist
          </h1>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 text-red-500 flex items-center justify-center hover:scale-105 transition z-10 text-sm"
                    aria-label="Remove from wishlist"
                  >
                    ❤️
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-gray-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-sm font-black text-gray-900 mt-2">
                    LKR {(item.discountPrice || item.price).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Move to Cart */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="w-full bg-gray-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-gray-700 transition"
                >
                  Move to Cart 🛒
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}