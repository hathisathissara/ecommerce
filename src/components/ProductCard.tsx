// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import { useRouter } from "next/navigation"; // useRouter import කළා

interface VariantType {
  size: string;
  price: number;
  discountPrice?: number;
  stock: number;
}

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category?: { name: string };
    variants?: VariantType[]; // <-- Variants array එක එකතු කළා
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const isLiked = isInWishlist(product._id);
  const hasVariants = product.variants && product.variants.length > 0;

  // 1. ⚡ DYNAMIC PRICE: ප්‍රභේද තිබේ නම් අඩුම මිල ගණනය කිරීමේ Logic එක ⚡
  const getLowestPrice = () => {
    if (!hasVariants) return product.discountPrice || product.price;
    
    // සියලුම Variants වල මිල ගණන් වලින් අඩුම මිල සොයයි
    const prices = product.variants!.map((v) => v.discountPrice || v.price);
    return Math.min(...prices);
  };

  const lowestPrice = getLowestPrice();

  // Discount % එක ගණනය කිරීම (Base product එක සඳහා පමණි)
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Smart Add to Cart Click Handler
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Link එක click වීම වළක්වයි
    
    if (hasVariants) {
      // Variants තිබේ නම්, පාරිභෝගිකයාට සයිස් එක තෝරන්න කෙලින්ම Product Page එකට යවයි
      router.push(`/products/${product.slug}`);
    } else {
      // Variants නැත්නම්, සාමාන්‍ය පරිදි Cart එකට කෙලින්ම ඇඩ් කරයි
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images[0],
      });
      alert(`${product.name} added to cart! 🛒`);
    }
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
        {!hasVariants && discountPercent > 0 && (
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
          {isLiked ? "❤️" : "♡"}
        </button>
      </Link>

      {/* Info */}
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-grow p-3.5 justify-between">
        <div>
          {/* Category සහ Variants Indicator Badge */}
          <div className="flex items-center justify-between mb-1 gap-1 flex-wrap">
            <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              {product.category?.name || "Cosmetic"}
            </p>
            
            {/* ⚡ අලුතින් එක්කළ: පාරිභෝගිකයාට සයිස් කිහිපයක් ඇති බව පෙන්වන බැනරය ⚡ */}
            {hasVariants && (
              <span className="text-[9px] bg-pink-50 text-pink-700 font-extrabold px-2 py-0.5 rounded-full">
                ✨ {product.variants!.length} Options Available
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-gray-700 transition">
            {product.name}
          </h3>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {hasVariants ? (
              // Variants තිබේ නම් "From LKR අඩුම_මිල" පෙන්වයි
              <span className="text-xs font-semibold text-gray-400">
                From <span className="text-sm font-black text-gray-900 block">LKR {lowestPrice.toLocaleString()}</span>
              </span>
            ) : (
              // Variants නැත්නම් සාමාන්‍ය මිල පෙන්වයි
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-gray-900">LKR {lowestPrice.toLocaleString()}</span>
                {product.discountPrice && (
                  <span className="line-through text-[11px] text-gray-400 font-normal">
                    LKR {product.price.toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Smart Add to Cart / Select Options Button */}
          <button
            onClick={handleCartClick}
            aria-label={hasVariants ? "Select Options" : "Add to cart"}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              hasVariants 
                ? "bg-white border-2 border-black text-black hover:bg-black hover:text-white" // ප්‍රභේද තිබේ නම් "Choose" ➔ බටන් එක පෙන්වයි
                : "bg-gray-900 text-white hover:bg-gray-700" // නැත්නම් සාමාන්‍ය Cart බටන් එක
            }`}
          >
            {hasVariants ? (
              // Choose options icon (➔)
              <span className="text-xs font-bold">➔</span>
            ) : (
              // Standard Cart Icon
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
            )}
          </button>
        </div>
      </Link>
    </div>
  );
}