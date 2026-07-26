// src/app/(store)/products/[slug]/ProductDetailsClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface VariantType {
  size?: string;
  color?: string;
  price: number;
  discountValue?: number;
  discountType?: string;
  discountPrice?: number;
  stock: number;
  sku?: string;
}

interface ProductProps {
  product: {
    _id: string;
    name: string;
    sku?: string; // <-- Base SKU එකතු කළා
    shortDescription?: string; // <-- Short Description එකතු කළා
    description: string;
    category: { _id: string; name: string; slug: string };
    subCategory?: string; // <-- Sub Category එකතු කළා
    brand?: { _id: string; name: string };
    price: number;
    discountValue?: number;
    discountType?: string;
    discountPrice?: number;
    tax?: number; // <-- Tax එකතු කළා
    stock: number;
    lowStockAlert?: number; // <-- lowStockAlert එකතු කළා
    stockStatus?: string; // <-- stockStatus එකතු කළා
    barcode?: string; // <-- barcode එකතු කළා
    trackInventory?: boolean; // <-- trackInventory එකතු කළා
    inStock: boolean;
    images: string[];
    variants?: VariantType[];
  };
  relatedProducts: any[];
}

interface ReviewType {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailsClient({ product, relatedProducts }: ProductProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  // Active Information Tab (Description | Specs | Shipping | Reviews)
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping" | "reviews">("description");

  // Reviews States
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revLoading, setRevLoading] = useState(false);

  // Multi-Attribute Variants (Size & Color)
  const hasVariants = product.variants && product.variants.length > 0;

  const availableSizes = hasVariants ? Array.from(new Set(product.variants!.map((v) => v.size).filter(Boolean))) : [];
  const availableColors = hasVariants ? Array.from(new Set(product.variants!.map((v) => v.color).filter(Boolean))) : [];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes.length > 0 ? (availableSizes[0] as string) : "");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors.length > 0 ? (availableColors[0] as string) : "");
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null);

  const isLiked = isInWishlist(product._id);

  // Auto-select matching variant on change
  useEffect(() => {
    if (hasVariants) {
      const match = product.variants!.find((v) => {
        const sizeMatch = selectedSize ? v.size === selectedSize : true;
        const colorMatch = selectedColor ? v.color === selectedColor : true;
        return sizeMatch && colorMatch;
      });
      setSelectedVariant(match || product.variants![0]);
    }
  }, [selectedSize, selectedColor, product._id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${product._id}`);
      if (res.ok) setReviews(await res.json());
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  useEffect(() => {
    fetchReviews();
    setActiveImage(product.images[0]);
    setQuantity(1);
  }, [product._id]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentDiscountPrice = selectedVariant ? selectedVariant.discountPrice : product.discountPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Discount Percentage ගණනය කිරීම
  const activeDiscountValue = selectedVariant ? (selectedVariant.discountValue || 0) : (product.discountValue || 0);
  const activeDiscountType = selectedVariant ? (selectedVariant.discountType || "Percentage") : (product.discountType || "Percentage");
  
  const discountPercentage = activeDiscountValue > 0 
    ? activeDiscountType === "Percentage" 
      ? activeDiscountValue 
      : Math.round((activeDiscountValue / currentPrice) * 100)
    : 0;

  const getCartItemDetails = () => {
    let variantDetails = [];
    if (selectedVariant?.size) variantDetails.push(selectedVariant.size);
    if (selectedVariant?.color) variantDetails.push(selectedVariant.color);
    
    const cartItemName = variantDetails.length > 0
      ? `${product.name} (${variantDetails.join(" / ")})`
      : product.name;

    const cartId = selectedVariant
      ? `${product._id}-${selectedVariant.size || ""}-${selectedVariant.color || ""}`
      : product._id;

    return { cartId, cartItemName };
  };

  const handleAddToCart = () => {
    if (quantity > currentStock) {
      alert(`Sorry, only ${currentStock} items left in stock!`);
      return;
    }
    const { cartId, cartItemName } = getCartItemDetails();
    addToCart({ _id: cartId, name: cartItemName, price: currentPrice, discountPrice: currentDiscountPrice, image: product.images[0] }, quantity);
  };

  const handleBuyNow = () => {
    if (quantity > currentStock) {
      alert(`Sorry, only ${currentStock} items left in stock!`);
      return;
    }
    const { cartId, cartItemName } = getCartItemDetails();
    addToCart({ _id: cartId, name: cartItemName, price: currentPrice, discountPrice: currentDiscountPrice, image: product.images[0] }, quantity);
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revComment) return;
    setRevLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, name: revName, rating: revRating, comment: revComment }),
      });
      if (res.ok) {
        setRevName(""); setRevComment(""); setRevRating(5);
        fetchReviews();
        alert("Review submitted successfully! ⭐");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      
      {/* 1. TOP BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-4">
        <Link href="/" className="hover:text-gray-700 transition">Home</Link>
        <span>›</span>
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-gray-700 transition">{product.category?.name}</Link>
        <span>›</span>
        <span className="text-gray-700 font-bold">{product.name}</span>
      </nav>

      {/* 2. SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square w-full border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 relative">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition duration-300" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 transition ${activeImage === img ? "border-black scale-105" : "border-gray-100"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
              {product.brand?.name || "Premium Brand"}
            </span>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-2">
              <span className="text-yellow-500 text-sm">{"★".repeat(Math.round(Number(averageRating) || 5))}</span>
              <span className="text-xs font-bold text-gray-500">
                {averageRating ? `(${averageRating} / 5.0 out of ${reviews.length} Reviews)` : "(No reviews yet)"}
              </span>
            </div>

            {(selectedVariant?.sku || product.sku) && (
              <span className="inline-block text-[10px] bg-gray-900/5 text-gray-600 px-2 py-0.5 rounded font-mono font-bold">
                SKU: {selectedVariant?.sku || product.sku}
              </span>
            )}

            <div className="flex items-center gap-3 pt-2">
              {currentDiscountPrice ? (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">LKR {currentDiscountPrice.toLocaleString()}</span>
                  <span className="text-base sm:text-lg text-gray-400 line-through font-medium">LKR {currentPrice.toLocaleString()}</span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-gray-900">LKR {currentPrice.toLocaleString()}</span>
              )}
            </div>

            <div>
              {currentStock > 0 ? (
                <div className="space-y-1">
                  <span className="text-green-600 text-xs font-bold">✓ In Stock (දිවයින පුරා බෙදාහැරීම)</span>
                  {currentStock <= 5 && (
                    <p className="text-red-600 text-[10px] font-black animate-pulse">🔥 Only {currentStock} items left in stock!</p>
                  )}
                </div>
              ) : (
                <span className="text-red-600 text-xs font-bold">✕ Out of Stock</span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl">
                {product.shortDescription}
              </p>
            )}

            {hasVariants && (
              <div className="space-y-4 border-t border-b py-4 border-gray-100">
                {availableColors.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Color Option</span>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColor(color as string)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition ${selectedColor === color ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Size Option</span>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSize(size as string)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition ${selectedSize === size ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            {currentStock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Quantity:</span>
                <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1.5 font-bold text-gray-600 hover:text-black hover:bg-gray-100">-</button>
                  <span className="px-4 font-semibold text-sm">{Math.min(quantity, currentStock)}</span>
                  <button onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))} className="px-3 py-1.5 font-bold text-gray-600 hover:text-black hover:bg-gray-100">+</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="w-full border-2 border-black text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition disabled:opacity-30"
              >
                {currentStock > 0 ? "Add to Cart 🛒" : "Out of Stock"}
              </button>
              {currentStock > 0 && (
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition"
                >
                  Buy Now ➔
                </button>
              )}
            </div>

            <button
              onClick={() => toggleWishlist({ _id: product._id, name: product.name, price: product.price, discountPrice: product.discountPrice, image: product.images[0] })}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-500 transition"
            >
              <span>{isLiked ? "❤️" : "♡"}</span>
              <span>{isLiked ? "In Your Wishlist" : "Add to Wishlist"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. TRUST BADGES */}
      <div className="border-t border-b py-6 border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col sm:flex-row justify-around items-center gap-4 text-xs font-bold text-gray-700">
        <div className="flex items-center space-x-2"><span>🚚</span> <span>Free Shipping Island-wide</span></div>
        <div className="flex items-center space-x-2"><span>🔒</span> <span>Secure Bank Payments</span></div>
        <div className="flex items-center space-x-2"><span>↩</span> <span>Easy 7-Day Returns</span></div>
      </div>

      {/* 4. INTERACTIVE TABS */}
      <div className="space-y-6">
        <div className="flex overflow-x-auto gap-6 sm:gap-10 border-b border-gray-100 pb-3 text-xs sm:text-sm font-black tracking-widest text-gray-400 uppercase">
          {["description", "specs", "shipping", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`transition pb-3 relative ${activeTab === tab ? "text-black border-b-2 border-black" : "hover:text-black"}`}
            >
              {tab === "specs" ? "Specifications" : tab}
            </button>
          ))}
        </div>

        <div className="min-h-[200px]">
          {activeTab === "description" && (
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-w-4xl animate-fade-in">
              {product.description}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-xl animate-fade-in">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <tbody>
                  <tr className="border-b border-gray-100"><td className="py-2.5 font-bold text-gray-900 w-1/3">Category</td><td className="py-2.5 text-gray-500">{product.category?.name}</td></tr>
                  {product.subCategory && <tr className="border-b border-gray-100"><td className="py-2.5 font-bold text-gray-900">Type</td><td className="py-2.5 text-gray-500">{product.subCategory}</td></tr>}
                  {product.brand && <tr className="border-b border-gray-100"><td className="py-2.5 font-bold text-gray-900">Brand</td><td className="py-2.5 text-gray-500">{product.brand.name}</td></tr>}
                  {product.sku && <tr className="border-b border-gray-100"><td className="py-2.5 font-bold text-gray-900">SKU Code</td><td className="py-2.5 text-gray-500 font-mono">{product.sku}</td></tr>}
                  {product.barcode && <tr className="border-b border-gray-100"><td className="py-2.5 font-bold text-gray-900">Barcode</td><td className="py-2.5 text-gray-500 font-mono">{product.barcode}</td></tr>}
                  <tr className="border-b border-gray-100"><td className="py-2.5 font-bold text-gray-900">Stock Availability</td><td className="py-2.5 text-gray-500">{product.stock > 0 ? `${product.stock} items left` : "Out of Stock"}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="text-sm text-gray-600 leading-relaxed max-w-4xl space-y-3 animate-fade-in">
              <p>📍 <strong>Island-wide Delivery Details:</strong></p>
              <p>• Delivery within Colombo and suburbs: 2-3 business days.</p>
              <p>• Delivery to outstation areas: 3-5 business days.</p>
              <p>• Standard shipping fees apply unless your order meets our Free Delivery Threshold.</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-in">
              <div className="bg-gray-50 p-6 rounded-2xl border h-fit">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Write a Customer Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Your Name</label>
                    <input type="text" value={revName} onChange={(e) => setRevName(e.target.value)} required placeholder="e.g. John Doe" className="w-full p-2.5 border rounded-lg outline-none bg-white focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Rating (Stars)</label>
                    <select value={revRating} onChange={(e) => setRevRating(Number(e.target.value))} className="w-full p-2.5 border rounded-lg bg-white outline-none">
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Your Comment</label>
                    <textarea value={revComment} onChange={(e) => setRevComment(e.target.value)} required placeholder="Write your honest review..." rows={3} className="w-full p-2.5 border rounded-lg outline-none bg-white focus:ring-1 focus:ring-black" />
                  </div>
                  <button type="submit" disabled={revLoading} className="w-full bg-black text-white py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition">
                    {revLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 space-y-6">
                <h3 className="text-sm font-bold text-gray-900">Customer Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-xs italic">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-800">{rev.name}</span>
                          <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-yellow-500 mt-1">{"★".repeat(rev.rating)}</div>
                        <p className="text-xs text-gray-600 mt-2 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. RELATED PRODUCTS */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t pt-12 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod: any) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}