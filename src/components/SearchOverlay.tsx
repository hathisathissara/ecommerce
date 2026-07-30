// src/components/SearchOverlay.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
}

interface SearchCategory {
  _id: string;
  name: string;
  slug: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setQuery("");
    setProducts([]);
    setCategories([]);
    onClose();
  }, [onClose]);

  // Focus input when overlay opens + lock body scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Debounced search
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setCategories([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch {
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchResults(value);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleProductClick = () => {
    onClose();
  };

  const handleCategoryClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  const hasResults = products.length > 0 || categories.length > 0;
  const showResults = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="relative bg-white shadow-2xl animate-slideDown">
        {/* Search Input Bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <div className="flex-grow relative">
              <label
                htmlFor="search-overlay-input"
                className="absolute -top-2 left-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase bg-white px-1"
              >
                Search
              </label>
              <input
                id="search-overlay-input"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder=""
                className="w-full border-2 border-gray-800 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 font-medium tracking-wide"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setProducts([]);
                    setCategories([]);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-900 transition"
              aria-label="Close search"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        </div>

        {/* Results Dropdown */}
        {showResults && (
          <div className="border-t border-gray-100 max-h-[70vh] overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                </div>
              ) : hasResults ? (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Categories / Suggestions */}
                  {categories.length > 0 && (
                    <div className="md:w-1/3 md:border-r md:border-gray-100 md:pr-6">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">
                        Suggestions
                      </h4>
                      <div className="space-y-1">
                        {categories.map((cat) => (
                          <Link
                            key={cat._id}
                            href={`/products?category=${cat.slug}`}
                            onClick={handleCategoryClick}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition font-medium"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Right: Products with Images */}
                  {products.length > 0 && (
                    <div className={categories.length > 0 ? "md:w-2/3" : "w-full"}>
                      <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">
                        Products
                      </h4>
                      <div className="space-y-3">
                        {products.map((prod) => (
                          <Link
                            key={prod._id}
                            href={`/products/${prod.slug}`}
                            onClick={handleProductClick}
                            className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl transition group"
                          >
                            {/* Product Thumbnail */}
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden relative border border-gray-100">
                              <Image
                                src={prod.images[0]}
                                alt={prod.name}
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-grow min-w-0">
                              <h5 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-gray-700 transition">
                                {prod.name}
                              </h5>
                              <div className="flex items-baseline gap-2 mt-1">
                                {prod.discountPrice ? (
                                  <>
                                    <span className="text-xs font-bold text-gray-400 line-through">
                                      Rs {prod.price.toLocaleString()}
                                    </span>
                                    <span className="text-sm font-black text-gray-900">
                                      Rs {prod.discountPrice.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-black text-gray-900">
                                    Rs {prod.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-400">
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {/* Full search link */}
              {query.trim() && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/products?search=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition font-medium tracking-wide uppercase"
                  >
                    <span>Search for &quot;{query}&quot;</span>
                    <span className="text-lg">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
