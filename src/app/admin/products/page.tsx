// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Next.js Image Component used [1]

interface ProductType {
  _id: string;
  name: string;
  sku?: string;
  shortDescription?: string;
  description: string;
  category: { _id: string; name: string };
  subCategory?: string;
  brand?: { _id: string; name: string };
  tags: string[];
  price: number;
  discountValue: number;
  discountType: "Percentage" | "Fixed";
  discountPrice?: number;
  tax?: number;
  stock: number;
  lowStockAlert: number;
  stockStatus: string;
  barcode?: string;
  trackInventory: boolean;
  variants: Array<{ size?: string; color?: string; price: number; discountValue?: number; discountType?: string; discountPrice?: number; stock: number; sku?: string }>;
  images: string[];
  isGiftItem: boolean;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductType[]>([]);
  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;
  
  // Loading indicator for fetching
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = async (page: number, search: string) => {
    setFetchLoading(true);
    try {
      const prodRes = await fetch(`/api/admin/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, debouncedSearch);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage, debouncedSearch]);


  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData(currentPage, debouncedSearch);
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Products 🛍️</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure catalogs, dynamic variants, prices, and stock inventory.</p>
        </div>
        
        {/* Add New Product Button */}
        <button
          onClick={() => router.push("/admin/products/new")}
          className="bg-black text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition duration-200 shadow-sm flex items-center gap-2"
        >
          <span>Add New Product</span> <span className="text-sm">➕</span>
        </button>
      </div>



      {fetchLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm font-medium text-gray-400 animate-pulse">Loading products...</p>
        </div>
      ) : (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">Products Inventory ({totalProducts})</h2>
            <p className="text-xs text-gray-400 mt-1">Review catalog items, prices, and stock statuses.</p>
          </div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Name, Category or SKU..." className="px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-gray-900 w-full sm:w-64 bg-white text-gray-900" />
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-10 text-xs italic">No matching products found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="p-3.5">Image</th>
                  <th className="p-3.5">Product Info</th>
                  <th className="p-3.5">Price</th>
                  {/* table head dynamic update */}
                  <th className="p-3.5">Stock & Variants</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border relative bg-gray-50 flex-shrink-0">
                        <Image src={prod.images[0]} alt="" fill unoptimized className="object-cover" />
                      </div>
                    </td>
                    <td className="p-3.5 space-y-1">
                      <p className="font-bold text-gray-900">{prod.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">{prod.category?.name}</span>
                        {/* Brand Badge display - No Brand fallback added */}
                        <span className="inline-block text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                          {prod.brand?.name || "No Brand"}
                        </span>
                        {prod.sku && (
                          <span className="inline-block text-[9px] bg-gray-900/5 text-gray-600 px-1.5 py-0.5 rounded font-mono font-bold">
                            SKU: {prod.sku}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">LKR {(prod.discountPrice || prod.price).toLocaleString()}</td>
                    
                    {/* ⚡ Bar showing Live Stock Alert Badges ⚡ */}
                    <td className="p-3.5 text-xs text-gray-500 space-y-1.5">
                      {prod.variants && prod.variants.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {prod.variants.map((v, i) => {
                            const isOut = v.stock <= 0;
                            const isLow = v.stock <= (prod.lowStockAlert || 5);
                            return (
                              <div key={i} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 space-y-1">
                                <p className="font-bold text-gray-700">• {v.size || "N/A"} / {v.color || "N/A"}:</p>
                                <div className="pl-3 space-y-1">
                                  {isOut ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-extrabold uppercase">
                                      🚨 Out of Stock
                                    </span>
                                  ) : isLow ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-extrabold uppercase animate-pulse">
                                      ⚠️ Low Stock ({v.stock} left)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                      🟢 {v.stock} left
                                    </span>
                                  )}
                                  {v.sku && <p className="text-[9px] text-gray-400 font-mono">SKU: {v.sku}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {prod.stock <= 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-extrabold uppercase tracking-wide">
                              🚨 OUT OF STOCK
                            </span>
                          ) : prod.stock <= (prod.lowStockAlert || 5) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-extrabold uppercase tracking-wide animate-pulse">
                              ⚠️ Low Stock ({prod.stock} left)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                              🟢 In Stock ({prod.stock} left)
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button onClick={() => router.push(`/admin/products/${prod._id}/edit`)} className="bg-gray-50 hover:bg-gray-900 hover:text-white border px-2.5 py-1.5 rounded-lg text-xs font-bold transition">Edit</button>
                        <button onClick={() => handleDeleteClick(prod._id)} className="bg-red-50 hover:bg-red-500 hover:text-white border text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      )}

    </div>
  );
}