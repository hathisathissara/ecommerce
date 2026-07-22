// src/components/CartDrawer.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface DbSettingsType {
  storeName: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dbSettings, setDbSettings] = useState<DbSettingsType | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setDbSettings(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        if (active) {
          setMounted(true);
        }
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) return null;

  const handleNavigate = (path: string) => {
    setIsCartOpen(false);
    router.push(path);
  };

  const deliveryCharge = dbSettings
    ? cartTotal >= dbSettings.freeDeliveryThreshold
      ? 0
      : dbSettings.deliveryCharge
    : 350;

  const freeShippingThreshold = dbSettings?.freeDeliveryThreshold || 5000;
  const amountToFreeShipping = freeShippingThreshold - cartTotal;
  const freeShippingProgress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  const finalTotal = cartTotal + deliveryCharge;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm">
                  🛍
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900">Your Cart</h2>
                  <p className="text-[11px] text-gray-400">
                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 transition flex items-center justify-center text-gray-500 hover:text-gray-900"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            {cartItems.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                {cartTotal >= freeShippingThreshold ? (
                  <p className="text-[11px] font-bold text-green-600 text-center">
                    🎉 You unlocked <span className="underline">FREE SHIPPING!</span>
                  </p>
                ) : (
                  <div className="space-y-1.5">
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
              </div>
            )}

            {/* Items */}
            <div className="flex-grow overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl">
                    🛒
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Your cart is empty</h3>
                    <p className="text-xs text-gray-400">Add some products to get started</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-700 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-start gap-3">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">LKR {(item.discountPrice || item.price).toLocaleString()}</p>

                        {/* Qty */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition text-sm font-bold"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 text-xs font-bold text-gray-900 border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition text-sm font-bold"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-[10px] text-gray-400 hover:text-red-500 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <span className="text-xs font-black text-gray-900 flex-shrink-0">
                        LKR {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                {/* Subtotal */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">LKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    {deliveryCharge === 0 ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-gray-900">LKR {deliveryCharge.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-gray-900 border-t border-gray-100 pt-2.5 font-black text-base">
                    <span>Total</span>
                    <span>LKR {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleNavigate("/cart")}
                    className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={() => handleNavigate("/checkout")}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-gray-700 transition"
                  >
                    Checkout →
                  </button>
                </div>

                <p className="text-center text-[10px] text-gray-400">
                  🔒 Secure & encrypted checkout
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}