// src/components/FilterBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

interface FilterBarProps {
  categories: CategoryType[];
  totalProducts: number;
}

export default function FilterBar({ categories, totalProducts }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeAvailability = searchParams.get("availability") || "";
  const activeGiftsByPrice = searchParams.get("giftsByPrice") || "";
  const activeGiftIdeas = searchParams.get("giftIdeas") || "";
  const activeSort = searchParams.get("sort") || "best-selling";

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
    setOpenDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const getCategoryLabel = () => {
    if (!activeCategory) return "Filter by Category";
    const found = categories.find((c) => c.slug === activeCategory);
    return found ? found.name : "Filter by Category";
  };

  const getAvailabilityLabel = () => {
    if (!activeAvailability) return "Availability";
    if (activeAvailability === "in-stock") return "In Stock";
    if (activeAvailability === "out-of-stock") return "Out of Stock";
    return "Availability";
  };

  const getGiftsByPriceLabel = () => {
    if (!activeGiftsByPrice) return "Gifts by Price";
    switch(activeGiftsByPrice) {
      case "under-5000": return "Under Rs 5,000";
      case "5000-10000": return "Rs 5,000 - Rs 10,000";
      case "over-10000": return "Over Rs 10,000";
      default: return "Gifts by Price";
    }
  };

  const getGiftIdeasLabel = () => {
    if (!activeGiftIdeas) return "Gift Ideas";
    switch(activeGiftIdeas) {
      case "for-him": return "For Him";
      case "for-her": return "For Her";
      case "corporate": return "Corporate Gifts";
      default: return "Gift Ideas";
    }
  };

  const getSortLabel = () => {
    switch (activeSort) {
      case "best-selling": return "Best selling";
      case "price-asc": return "Price, low to high";
      case "price-desc": return "Price, high to low";
      case "name-asc": return "Alphabetically, A-Z";
      case "name-desc": return "Alphabetically, Z-A";
      case "oldest": return "Date, old to new";
      case "newest": return "Date, new to old";
      default: return "Best selling";
    }
  };

  const sortOptions = [
    { value: "best-selling", label: "Best selling" },
    { value: "newest", label: "Date, new to old" },
    { value: "oldest", label: "Date, old to new" },
    { value: "price-asc", label: "Price, low to high" },
    { value: "price-desc", label: "Price, high to low" },
    { value: "name-asc", label: "Alphabetically, A-Z" },
    { value: "name-desc", label: "Alphabetically, Z-A" },
  ];

  return (
    <div ref={dropdownRef} className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4 flex-wrap">
          
          {/* Left: Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs font-medium text-gray-500 mr-2 hidden sm:inline">Filter:</span>

            {/* Filter by Category */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("category")}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition border-b-2 ${
                  activeCategory
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {getCategoryLabel()}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${openDropdown === "category" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openDropdown === "category" && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 max-h-72 overflow-y-auto">
                  <button
                    onClick={() => applyFilter("category", "")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      !activeCategory
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => applyFilter("category", cat.slug)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        activeCategory === cat.slug
                          ? "bg-gray-50 text-gray-900 font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gifts by Price */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("giftsByPrice")}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition border-b-2 ${
                  activeGiftsByPrice
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {getGiftsByPriceLabel()}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${openDropdown === "giftsByPrice" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openDropdown === "giftsByPrice" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={() => applyFilter("giftsByPrice", "")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      !activeGiftsByPrice
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => applyFilter("giftsByPrice", "under-5000")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeGiftsByPrice === "under-5000"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    Under Rs 5,000
                  </button>
                  <button
                    onClick={() => applyFilter("giftsByPrice", "5000-10000")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeGiftsByPrice === "5000-10000"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    Rs 5,000 - Rs 10,000
                  </button>
                  <button
                    onClick={() => applyFilter("giftsByPrice", "over-10000")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeGiftsByPrice === "over-10000"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    Over Rs 10,000
                  </button>
                </div>
              )}
            </div>

            {/* Gift Ideas */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("giftIdeas")}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition border-b-2 ${
                  activeGiftIdeas
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {getGiftIdeasLabel()}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${openDropdown === "giftIdeas" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openDropdown === "giftIdeas" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={() => applyFilter("giftIdeas", "")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      !activeGiftIdeas
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => applyFilter("giftIdeas", "for-him")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeGiftIdeas === "for-him"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    For Him
                  </button>
                  <button
                    onClick={() => applyFilter("giftIdeas", "for-her")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeGiftIdeas === "for-her"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    For Her
                  </button>
                  <button
                    onClick={() => applyFilter("giftIdeas", "corporate")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeGiftIdeas === "corporate"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    Corporate Gifts
                  </button>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("availability")}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition border-b-2 ${
                  activeAvailability
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {getAvailabilityLabel()}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${openDropdown === "availability" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openDropdown === "availability" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={() => applyFilter("availability", "")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      !activeAvailability
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => applyFilter("availability", "in-stock")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeAvailability === "in-stock"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => applyFilter("availability", "out-of-stock")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      activeAvailability === "out-of-stock"
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sort + Count */}
          <div className="flex items-center gap-4">
            {/* Sort */}
            <div className="relative flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 hidden sm:inline">Sort by:</span>
              <button
                onClick={() => toggleDropdown("sort")}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold tracking-wide text-gray-700 hover:text-gray-900 transition border border-gray-200 rounded-lg"
              >
                {getSortLabel()}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${openDropdown === "sort" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openDropdown === "sort" && (
                <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => applyFilter("sort", opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        activeSort === opt.value
                          ? "bg-gray-50 text-gray-900 font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product count */}
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              {totalProducts} {totalProducts === 1 ? "product" : "products"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
