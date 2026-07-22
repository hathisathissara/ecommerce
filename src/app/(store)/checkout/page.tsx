// src/app/(store)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface DbSettingsType {
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Customer Shipping Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BankTransfer">("COD");
  const [slipFile, setSlipFile] = useState<File | null>(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Database Settings State
  const [dbSettings, setDbSettings] = useState<DbSettingsType | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchDbSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (active) setDbSettings(data);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        if (active) setMounted(true);
      }
    };
    fetchDbSettings();
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-medium text-gray-400 animate-pulse">Loading Checkout...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mb-6">Please add items to your cart before checking out.</p>
        <Link href="/products" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-700 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, totalAmount: cartTotal }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.code);
        setDiscountAmount(data.discountAmount);
        setCouponCode("");
      } else {
        setCouponError(data.error || "Invalid coupon");
        setDiscountAmount(0);
        setAppliedCoupon("");
      }
    } catch {
      setCouponError("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setDiscountAmount(0);
    setCouponError("");
  };

  const deliveryCharge = dbSettings
    ? cartTotal >= dbSettings.freeDeliveryThreshold
      ? 0
      : dbSettings.deliveryCharge
    : 350;

  const finalTotal = cartTotal + deliveryCharge - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setError("Please fill in all shipping details.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let bankSlipUrl = "";

      if (paymentMethod === "BankTransfer") {
        if (!slipFile) throw new Error("Please upload the bank deposit slip.");
        const formData = new FormData();
        formData.append("file", slipFile);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Bank slip upload failed. Try again.");
        const uploadData = await uploadRes.json();
        bankSlipUrl = uploadData.url;
      }

      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, phone, address },
          items: cartItems,
          totalAmount: finalTotal,
          couponCode: appliedCoupon || undefined,
          discountAmount,
          shippingFee: deliveryCharge,
          paymentMethod,
          bankSlip: bankSlipUrl || undefined,
        }),
      });

      const orderData = await orderRes.json();

      if (orderRes.ok) {
        clearCart();
        router.push(`/checkout/success?orderId=${orderData.orderId}`);
      } else {
        setError(orderData.error || "Failed to place order.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <Link href="/cart" className="hover:text-gray-700 transition">Cart</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Checkout</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Shipping Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-lg font-black text-gray-900 mb-5">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      placeholder="Street address, City, Province"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 mb-5">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 text-center gap-1.5 ${
                      paymentMethod === "COD"
                        ? "border-gray-900 bg-gray-50/50 text-gray-900"
                        : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600"
                    }`}
                  >
                    <span className="text-2xl">💵</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BankTransfer")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 text-center gap-1.5 ${
                      paymentMethod === "BankTransfer"
                        ? "border-gray-900 bg-gray-50/50 text-gray-900"
                        : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600"
                    }`}
                  >
                    <span className="text-2xl">🏦</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Bank Transfer</span>
                  </button>
                </div>

                {paymentMethod === "BankTransfer" && dbSettings && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 text-xs">
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-3">Please deposit to the following bank account:</p>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-b border-gray-200 pb-3 mb-3 text-gray-600">
                        <span className="font-medium">Bank Name</span>
                        <span className="font-semibold text-gray-900 text-right">{dbSettings.bankName}</span>
                        <span className="font-medium">Account Name</span>
                        <span className="font-semibold text-gray-900 text-right">{dbSettings.bankAccountName}</span>
                        <span className="font-medium">Account Number</span>
                        <span className="font-semibold text-gray-900 text-right">{dbSettings.bankAccountNumber}</span>
                        <span className="font-medium">Branch</span>
                        <span className="font-semibold text-gray-900 text-right">{dbSettings.bankBranch}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                        Upload Bank Slip Image *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                        className="w-full p-2 border border-dashed border-gray-200 rounded-xl bg-white text-xs text-gray-500"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-4 rounded-xl text-sm transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Order...
                  </>
                ) : (
                  <>Place Order (LKR {finalTotal.toLocaleString()})</>
                )}
              </button>
            </form>
          </div>

          {/* Right: Order Summary & Coupon */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Your Order Summary</h2>

              {/* Item List */}
              <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto pr-2 space-y-3.5">
                {cartItems.map((item) => (
                  <div key={item._id} className="pt-3.5 first:pt-0 flex items-center justify-between text-xs sm:text-sm gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 relative flex-shrink-0 bg-white">
                        <Image src={item.image} alt="" fill className="object-cover" unoptimized />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      LKR {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="border-t border-gray-200 pt-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Promo Code
                </label>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex justify-between items-center text-xs text-green-800 font-semibold">
                    <span>✔ Coupon &ldquo;{appliedCoupon}&rdquo; applied!</span>
                    <button onClick={handleRemoveCoupon} className="text-red-500 font-bold hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. SAVE10"
                      className="flex-grow px-3 py-2 text-xs border rounded-lg uppercase outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-700 transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-red-500 text-[11px] mt-2 bg-red-50 p-2 rounded-lg">
                    ⚠️ {couponError}
                  </p>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-gray-200 pt-5 space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">LKR {cartTotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-500 font-medium">
                    <span>Discount</span>
                    <span>- LKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Cost</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">LKR {deliveryCharge.toLocaleString()}</span>
                  )}
                </div>

                {dbSettings && cartTotal < dbSettings.freeDeliveryThreshold && (
                  <div className="bg-white border border-gray-100 p-3 rounded-xl text-center text-[10px] text-gray-500">
                    💡 Add <span className="font-bold text-gray-900">LKR {(dbSettings.freeDeliveryThreshold - cartTotal).toLocaleString()}</span> more for <span className="text-green-600 font-bold">FREE SHIPPING!</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-base sm:text-lg font-black text-gray-900 border-t border-gray-200 pt-3.5">
                  <span>Total</span>
                  <span>LKR {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}