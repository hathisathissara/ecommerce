// src/app/admin/coupons/page.tsx
"use client";

import { useState, useEffect } from "react";

interface CouponType {
  _id: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"Percentage" | "Fixed">("Percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchCoupons(); };
    init();
  }, []);

  const handleEditClick = (coupon: CouponType) => {
    setIsEditing(true);
    setEditingCouponId(coupon._id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinOrderAmount(coupon.minOrderAmount.toString());
    setIsActive(coupon.isActive);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCouponId("");
    setCode("");
    setDiscountType("Percentage");
    setDiscountValue("");
    setMinOrderAmount("");
    setIsActive(true);
    setError("");
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCoupons();
        if (editingCouponId === id) handleCancelEdit();
      }
    } catch (err) {
      console.error("Failed to delete coupon", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      setError("Please fill required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = "/api/admin/coupons";
      const apiMethod = isEditing ? "PUT" : "POST";

      const res = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId: isEditing ? editingCouponId : undefined,
          code,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
          isActive: isEditing ? isActive : true,
        }),
      });

      if (res.ok) {
        handleCancelEdit();
        fetchCoupons();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save coupon");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Coupons</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure and manage active store coupon promotional discount rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add / Edit Form Card */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              {isEditing ? "Edit Coupon" : "Create Coupon"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Set discount parameters and minimum checkout thresholds.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "Percentage" | "Fixed")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (LKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Min Order Amount (LKR)
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            
            {isEditing && (
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-gray-900 border-gray-200 outline-none focus:ring-0"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-gray-600">
                  Coupon is Active
                </label>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-gray-900 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-700 transition duration-200 disabled:opacity-60"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Create Coupon"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="border border-gray-200 text-gray-700 px-4 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Coupons Panel */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">Active Coupons</h2>
            <p className="text-xs text-gray-400 mt-1">Review active promotional configurations.</p>
          </div>

          {coupons.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No coupons created yet.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Min Spend</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3.5 font-mono font-bold text-gray-900">{coupon.code}</td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {coupon.discountType === "Percentage" ? `${coupon.discountValue}%` : `LKR ${coupon.discountValue.toLocaleString()}`}
                      </td>
                      <td className="p-3.5 font-semibold text-gray-500">
                        LKR {coupon.minOrderAmount.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            coupon.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(coupon)}
                            className="bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(coupon._id)}
                            className="bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}