// src/app/(store)/products/[slug]/ProductDetailsClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import Link from "next/link";

interface VariantType {
  size: string;
  price: number;
  discountPrice?: number;
  stock: number;
}

interface ProductProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    stock: number;
    images: string[];
    category: { name: string };
    brand?: { name: string };
    inStock: boolean;
    variants?: VariantType[];
  };
}

interface ReviewType {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailsClient({ product }: ProductProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revLoading, setRevLoading] = useState(false);

  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(
    hasVariants ? product.variants![0] : null
  );

  const isLiked = isInWishlist(product._id);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${product._id}`);
      if (res.ok) setReviews(await res.json());
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${product._id}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };
    fetchReviews();
    return () => {
      active = false;
    };
  }, [product._id]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentDiscountPrice = selectedVariant ? selectedVariant.discountPrice : product.discountPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    if (quantity > currentStock) {
      alert(`Sorry, only ${currentStock} items left in stock!`);
      return;
    }

    const cartItemName = selectedVariant
      ? `${product.name} (${selectedVariant.size})`
      : product.name;

    addToCart(
      {
        _id: selectedVariant ? `${product._id}-${selectedVariant.size}` : product._id,
        name: cartItemName,
        price: currentPrice,
        discountPrice: currentDiscountPrice,
        image: product.images[0],
      },
      quantity
    );
    alert(`${quantity} ${cartItemName} added to cart! 🛒`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revComment) return;

    setRevLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          name: revName,
          rating: revRating,
          comment: revComment,
        }),
      });

      if (res.ok) {
        setRevName("");
        setRevComment("");
        setRevRating(5);
        fetchReviews();
        alert("Review submitted successfully! Thank you. ⭐");
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setRevLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <Link href="/products" className="hover:text-gray-700 transition">Shop</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square w-full border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 relative">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                unoptimized
                priority
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 border-2 rounded-xl overflow-hidden flex-shrink-0 transition relative bg-gray-50 ${
                      activeImage === img ? "border-gray-900" : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <Image src={img} alt="" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {product.brand?.name || "Premium Quality"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-1 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() =>
                  toggleWishlist({
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    discountPrice: product.discountPrice,
                    image: product.images[0],
                  })
                }
                className={`w-11 h-11 flex items-center justify-center rounded-full border shadow-sm transition-all duration-200 flex-shrink-0 ${
                  isLiked
                    ? "bg-red-50 text-red-500 border-red-100"
                    : "bg-white text-gray-400 hover:text-red-400 border-gray-200"
                }`}
              >
                {isLiked ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Rating */}
            {averageRating && (
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <span className="text-yellow-500 font-bold text-sm">
                  {"★".repeat(Math.round(Number(averageRating)))}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  ({averageRating} rating from {reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price & Stock */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-baseline gap-3">
                {currentDiscountPrice ? (
                  <>
                    <span className="text-2xl font-black text-gray-900">
                      LKR {currentDiscountPrice.toLocaleString()}
                    </span>
                    <span className="text-base text-gray-400 line-through">
                      LKR {currentPrice.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-black text-gray-900">
                    LKR {currentPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div>
                {currentStock > 0 ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block animate-pulse" />
                      In Stock
                    </span>
                    {currentStock <= 5 && (
                      <p className="text-[10px] text-red-600 font-extrabold animate-pulse">
                        🔥 Only {currentStock} left!
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Variants */}
            {hasVariants && (
              <div className="space-y-2 border-t border-gray-100 pt-5">
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Select Size
                </label>
                <div className="flex gap-2">
                  {product.variants!.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-200 ${
                        selectedVariant?.size === v.size
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 hover:border-gray-400 bg-white text-gray-700"
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-100 pt-5 space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Description
              </label>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Add to Cart Actions */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              {currentStock > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                    >
                      −
                    </button>
                    <span className="px-4 text-xs font-bold text-gray-900">
                      {Math.min(quantity, currentStock)}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      className="px-3 py-1.5 font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStock > 0 ? "Add to Cart 🛒" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-100 mt-16 pt-12">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-8">
            Customer Reviews ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Review Form */}
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                Share your thoughts
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    required
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Rating
                  </label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Comment
                  </label>
                  <textarea
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    required
                    placeholder="Describe your experience with this item..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={revLoading}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-gray-700 transition"
                >
                  {revLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>

            {/* Review List */}
            <div className="lg:col-span-2 space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 border border-gray-100 rounded-2xl">
                  <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to leave one!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="border border-gray-100 p-5 rounded-2xl bg-white space-y-2">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">{rev.name}</span>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-yellow-500">{"★".repeat(rev.rating)}</div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}