// src/app/(store)/cart/page.tsx
"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

interface DbSettings {
  freeDeliveryThreshold?: number;
  freeShippingThreshold?: number;
  shippingFee?: number;
  deliveryCharge?: number;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);
  const [dbSettings, setDbSettings] = useState<DbSettings | null>(null);

  useEffect(() => {
    const init = async () => {
      setMounted(true);
      try {
        const res = await fetch("/api/settings");
        if (res.ok) setDbSettings(await res.json());
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    init();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-medium text-gray-400 animate-pulse">Loading Cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl mb-6">
          🛒
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mb-8 max-w-sm leading-relaxed">
          Looks like you haven&apos;t added anything to your cart yet. Browse our products to find something special.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-700 transition"
        >
          Continue Shopping <span>→</span>
        </Link>
      </div>
    );
  }

  const deliveryCharge: number = dbSettings
    ? (cartTotal >= (dbSettings.freeDeliveryThreshold ?? 5000)
      ? 0
      : (dbSettings.deliveryCharge ?? 350))
    : 350;

  const freeShippingThreshold = dbSettings?.freeDeliveryThreshold ?? 5000;
  const amountToFreeShipping = freeShippingThreshold - cartTotal;
  const freeShippingProgress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  const finalTotal = cartTotal + deliveryCharge;

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Cart</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Shopping Cart
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 p-4 sm:p-5 rounded-2xl bg-white hover:border-gray-200 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      LKR {(item.discountPrice || item.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-gray-900 border-x border-gray-200 w-10 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right">
                    <span className="block font-black text-gray-900 text-sm sm:text-base">
                      LKR {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium mt-1 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 h-fit space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            {/* Free Shipping Progress */}
            {cartTotal >= freeShippingThreshold ? (
              <div className="bg-green-50 border border-green-100 p-3.5 rounded-xl text-center">
                <p className="text-[11px] font-bold text-green-700">
                  🎉 You unlocked <span className="underline">FREE SHIPPING!</span>
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-2">
                <p className="text-[11px] text-gray-500 text-center">
                  Add <span className="font-bold text-gray-900">LKR {amountToFreeShipping.toLocaleString()}</span> more for free shipping
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3.5 border-y border-gray-200 py-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">LKR {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Cost</span>
                {deliveryCharge === 0 ? (
                  <span className="text-green-600 font-bold">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">LKR {deliveryCharge.toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-black text-gray-900">
              <span>Total</span>
              <span className="text-xl">LKR {finalTotal.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="block text-center w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-700 transition duration-200"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}