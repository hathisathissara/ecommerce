// src/app/admin/reviews/page.tsx
"use client";

import { useState, useEffect } from "react";

interface ReviewType {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  product?: { name: string };
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) setReviews(await res.json());
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchReviews(); };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Reviews</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Moderate customer reviews and feedback submitted on product detail pages.</p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm font-medium text-gray-400 animate-pulse">Loading reviews...</p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">All Customer Reviews ({reviews.length})</h2>
            <p className="text-xs text-gray-400 mt-1">Review star ratings and delete inappropriate postings.</p>
          </div>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="border border-gray-100 p-5 rounded-2xl bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gray-300 transition duration-200">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-gray-950">{rev.name}</span>
                      <span className="text-xs text-yellow-500 font-medium">{"★".repeat(rev.rating)}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Product: <span className="text-gray-900 underline">{rev.product?.name || "Deleted Product"}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                      &quot;{rev.comment}&quot;
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Submitted on: {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="sm:self-center bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-200 flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}