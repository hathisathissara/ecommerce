// src/components/FilterSidebar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  categories: CategoryType[];
}

export default function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(currentSearch);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const activeCategory = searchParams.get("category") || "";

  // Sync local search state when URL search param changes externally
  if (search !== currentSearch && document.activeElement?.id !== "sidebar-search-input") {
    setSearch(currentSearch);
  }

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/products?${params.toString()}`);
    setMobileOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const handleReset = () => {
    setSearch("");
    router.push("/products");
    setMobileOpen(false);
  };

  const hasActiveFilters = !!(activeCategory || search);

  const filterContent = (
    <div className="space-y-6">
      {/* Header (inside panel) */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">
          Search
        </label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-grow px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-700 transition"
          >
            Go
          </button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <button
          type="button"
          onClick={() => setCategoryOpen((prev) => !prev)}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Category
          </span>
          <svg
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 group-hover:text-gray-900 ${
              categoryOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            categoryOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1">
            <button
              onClick={() => applyFilters({ category: "" })}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition ${
                !activeCategory
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              All Products
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => applyFilters({ category: cat.slug })}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition ${
                  activeCategory === cat.slug
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
            hasActiveFilters
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />}
        </button>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
            {filterContent}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-2xl p-5 h-fit shadow-sm sticky top-24">
        {filterContent}
      </div>
    </>
  );
}