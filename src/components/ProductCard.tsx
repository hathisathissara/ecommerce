// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Imported useRouter

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
    variants?: VariantType[]; // <-- Added Variants array
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const isLiked = isInWishlist(product._id);
  const hasVariants = product.variants && product.variants.length > 0;

  // 1. ⚡ DYNAMIC PRICE: Logic to calculate the lowest price if there are variants ⚡
  const getLowestPrice = () => {
    if (!hasVariants) return product.discountPrice || product.price;
    
    // Searches for the lowest price of all variants
    const prices = product.variants!.map((v) => v.discountPrice || v.price);
    return Math.min(...prices);
  };

  const lowestPrice = getLowestPrice();

  // Calculation of Discount % — works for both base products and variants
  const discountPercent = (() => {
    if (hasVariants) {
      // Find the highest discount % among all variants that have a discountPrice
      const percents = product.variants!
        .filter((v) => v.discountPrice && v.discountPrice > 0 && v.price > 0)
        .map((v) => Math.round(((v.price - v.discountPrice!) / v.price) * 100));
      return percents.length > 0 ? Math.max(...percents) : 0;
    }
    return product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;
  })();

  // Smart Add to Cart Click Handler
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the link from being clicked
    
    if (hasVariants) {
      // If Variants are available, the customer selects the size and is sent directly to the Product Page
      router.push(`/products/${product.slug}`);
    } else {
      // If there are no variants, it will be added directly to the cart as usual
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
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full tracking-wide shadow-sm">
            -{discountPercent}% OFF
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
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-grow p-3.5 justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center mb-1">
            <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              {product.category?.name || "Cosmetic"}
            </p>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-gray-700 transition">
            {product.name}
          </h3>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {hasVariants ? (
              // Variants: show lowest price + small size pills
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-[9px] text-gray-400 font-medium">From</span>
                  <span className="text-sm font-black text-gray-900">LKR {lowestPrice.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.variants!.slice(0, 3).map((v, i) => (
                    <span key={i} className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {v.size}
                    </span>
                  ))}
                  {product.variants!.length > 3 && (
                    <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      +{product.variants!.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              // Normal price with optional strikethrough
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
                ? "bg-white border-2 border-black text-black hover:bg-black hover:text-white" // "Choose" ➔ button will show if variants are available
                : "bg-gray-900 text-white hover:bg-gray-700" // Or the normal Cart button
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