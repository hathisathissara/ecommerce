// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category?: { name: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product._id);
  const displayPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
    });
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col">
      {/* Image Area */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full tracking-wide">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            isLiked
              ? "bg-red-50 text-red-500 border border-red-100"
              : "bg-white/90 text-gray-400 hover:text-red-400 border border-gray-100"
          }`}
        >
          {isLiked ? "🤍" : "♡"}
        </button>
      </Link>

      {/* Info */}
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-grow p-3.5">
        <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          {product.category?.name || "Cosmetic"}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-gray-700 transition flex-grow">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center justify-between gap-2 mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-gray-900">LKR {displayPrice.toLocaleString()}</span>
            {product.discountPrice && (
              <span className="line-through text-[11px] text-gray-400 font-normal">
                LKR {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart icon button - always visible */}
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 active:scale-95 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </Link>
    </div>
  );
}