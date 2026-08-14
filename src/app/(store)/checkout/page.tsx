// src/app/(store)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

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
  const [dbSettings, setDbSettings] = useState<{ 
    freeDeliveryThreshold: number; 
    deliveryCharge: number;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankBranch?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    
    const fetchDbSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) setDbSettings(await res.json());
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchDbSettings();
  }, []);

  if (!mounted) return <p className="text-center py-20">Loading Checkout...</p>;
  if (cartItems.length === 0) {
    return <p className="text-center py-20">Your cart is empty. Please add items to checkout.</p>;
  }

  // Coupon Apply Logic (div set as a button click handler)
  const handleApplyCouponClick = async () => {
    if (!couponCode) return;

    if (!email) {
      setCouponError("Please enter your email address first to apply a coupon.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: couponCode, 
          totalAmount: cartTotal, 
          email: email.trim() 
        }),
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

  const originalSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalProductDiscount = cartItems.reduce((sum, item) => sum + (item.discountPrice ? (item.price - item.discountPrice) * item.quantity : 0), 0);

  const deliveryCharge = dbSettings
    ? cartTotal >= dbSettings.freeDeliveryThreshold
      ? 0
      : dbSettings.deliveryCharge
    : 350;

  const finalTotal = originalSubtotal - totalProductDiscount - discountAmount + deliveryCharge;

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
          customer: { name, email: email.trim(), phone, address },
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
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ⚡ The entire page is surrounded by a single Form ⚡
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Checkout 💳</h1>
      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2.5 rounded">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side (col-span-7): Shipping & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Shipping Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-950" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-950" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone Number *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-950" placeholder="e.g. 0771234567" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Delivery Address *</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-950" required />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 border-b pb-2 pt-6">Payment Method</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod("COD")}
              className={`flex-1 py-3 border-2 rounded-xl font-semibold transition ${paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-200"}`}
            >
              💵 COD
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("BankTransfer")}
              className={`flex-1 py-3 border-2 rounded-xl font-semibold transition ${paymentMethod === "BankTransfer" ? "border-black bg-gray-50" : "border-gray-200"}`}
            >
              🏦 Bank Transfer
            </button>
          </div>

          {paymentMethod === "BankTransfer" && dbSettings && (
            <div className="p-4 bg-gray-50 rounded-xl border space-y-3 text-sm">
              <p className="font-bold text-gray-800">Our Bank Details:</p>
              <p>• Bank: {dbSettings.bankName}</p>
              <p>• Account Name: {dbSettings.bankAccountName}</p>
              <p>• Account Number: {dbSettings.bankAccountNumber}</p>
              <p>• Branch: {dbSettings.bankBranch}</p>
              
              <div className="pt-2">
                <label className="block text-sm font-semibold mb-2 text-red-600">Upload Bank Slip *</label>
                <input type="file" accept="image/*" onChange={(e) => setSlipFile(e.target.files?.[0] || null)} className="w-full p-1.5 border rounded bg-white text-xs" required />
              </div>
            </div>
          )}
        </div>

        {/* Right side (col-span-5): Order Summary, Coupons, and Place Order Button */}
        <div className="lg:col-span-5 bg-gray-50 p-6 rounded-2xl border space-y-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Your Order Summary</h2>
          <div className="divide-y max-h-48 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item._id} className="py-3 flex justify-between text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  {item.discountPrice ? (
                    <>
                      <div className="font-bold">LKR {(item.discountPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-gray-400 line-through">LKR {(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </>
                  ) : (
                    <span className="font-bold">LKR {(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Box (a simple div instead of a nested form) */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Have a Promo Code?</h3>
            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex justify-between items-center text-sm text-green-800">
                <p>✔ Coupon <strong>{appliedCoupon}</strong> Applied!</p>
                <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. SAVE10"
                  className="w-full px-3 py-2 text-sm border rounded-lg uppercase outline-none bg-white text-gray-950"
                />
                <button 
                  type="button" // Due to type="button" pressing this will not submit the entire order
                  onClick={handleApplyCouponClick} 
                  disabled={couponLoading || !couponCode} 
                  className="bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2 bg-red-50 p-1.5 rounded">{couponError}</p>}
          </div>

          {/* Bill Summary */}
          <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>LKR {originalSubtotal.toFixed(2)}</span>
            </div>
            {totalProductDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Product Discount</span>
                <span>- LKR {totalProductDiscount.toFixed(2)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Coupon Discount ({appliedCoupon})</span>
                <span>- LKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Cost</span>
              {deliveryCharge === 0 ? (
                <span className="text-green-600 font-bold">FREE</span>
              ) : (
                <span>LKR {deliveryCharge.toFixed(2)}</span>
              )}
            </div>
            
            {dbSettings && cartTotal < dbSettings.freeDeliveryThreshold && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-800 text-center font-semibold">
                💡 Add <span className="font-bold">LKR {(dbSettings.freeDeliveryThreshold - cartTotal).toFixed(2)}</span> more to get <span className="text-green-600 font-bold">FREE SHIPPING!</span>
              </div>
            )}
 
            <div className="flex justify-between items-center text-lg font-extrabold text-gray-900 border-t pt-2 mb-4">
              <span>Grand Total</span>
              <span>LKR {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* ⚡ PLACE ORDER BUTTON (now nicely enabled right below the bill) ⚡ */}
          <button
            type="submit" // Submit the entire form directly
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? "Placing Order..." : "Place Order 📦"}
          </button>
        </div>

      </div>
    </form>
  );
}