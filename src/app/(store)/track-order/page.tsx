// src/app/(store)/track-order/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TrackedOrderType {
  _id: string;
  customer: { name: string };
  status: "Pending" | "Processing" | "Shipped" | "Cancelled";
  totalAmount: number;
  createdAt: string;
  items: Array<{ _id: string; name: string; quantity: number }>;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<TrackedOrderType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialOrderId) {
      handleTrackByOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  async function handleTrackByOrderId(id: string) {
    if (!id) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.error || "Order not found. Please double-check your Order ID.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    handleTrackByOrderId(orderId);
  };

  const getStatusStep = (status: string) => {
    if (status === "Pending") return 1;
    if (status === "Processing") return 2;
    if (status === "Shipped") return 3;
    return 0;
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Track Order</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Track Your Order
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Search Panel */}
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-sm mb-10">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4 text-center">
            Enter your order identifier below
          </p>
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (e.g. 65b2a3...)"
              className="flex-grow px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white text-gray-900"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="sm:flex-shrink-0 bg-gray-900 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-gray-700 transition disabled:opacity-60"
            >
              {loading ? "Tracking..." : "Track Order"}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-semibold text-center">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {order && (
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-lg space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                <p className="text-xs font-mono text-gray-600 mt-1">{order._id}</p>
                <h2 className="text-base font-bold text-gray-900 mt-2">Recipient: {order.customer.name}</h2>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Placed</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Timeline Progress */}
            {order.status === "Cancelled" ? (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center font-bold text-sm">
                ❌ This order has been Cancelled
              </div>
            ) : (
              <div className="py-4">
                <div className="relative flex justify-between items-center w-full max-w-md mx-auto">
                  {/* Progress Line */}
                  <div className="absolute left-0 right-0 h-1 bg-gray-100 -z-10 rounded-full" />
                  <div
                    className="absolute left-0 h-1 bg-gray-900 -z-10 transition-all duration-500 rounded-full"
                    style={{ width: currentStep <= 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
                  />

                  {/* Steps */}
                  {[
                    { step: 1, label: "Pending", icon: "⏳" },
                    { step: 2, label: "Processing", icon: "⚙️" },
                    { step: 3, label: "Shipped", icon: "🚚" },
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all duration-300 ${
                          currentStep >= s.step
                            ? "bg-gray-900 text-white"
                            : "bg-white border border-gray-200 text-gray-400"
                        }`}
                      >
                        {currentStep >= s.step ? s.icon : s.step}
                      </div>
                      <span className="text-[11px] font-bold mt-2.5 text-gray-600">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items Summary */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest">Order Items</h3>
              <div className="divide-y divide-gray-100 text-xs sm:text-sm">
                {order.items.map((item) => (
                  <div key={item._id} className="py-3 flex justify-between items-center text-gray-600">
                    <span>
                      {item.name} <span className="text-gray-400 font-bold ml-1.5">× {item.quantity}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center font-black text-gray-900 text-sm sm:text-base">
                <span>Total Bill</span>
                <span>LKR {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold bg-gray-50">Loading Tracking Info...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}