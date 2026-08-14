// src/app/(store)/checkout/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

interface OrderType {
  _id: string;
  orderNumber?: string;
  invoiceNumber?: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: Array<{
    _id: string;
    name: string;
    quantity: number;
    image: string;
    description?: string;
    sku?: string;
    size?: string;
    color?: string;
    originalPrice: number;
    productDiscount: number;
    finalPrice: number;
    total: number;
    
    // Legacy fields
    price: number;
    discountPrice?: number;
  }>;
  subtotal?: number;
  totalProductDiscount?: number;
  coupon?: {
    code?: string;
    discountType?: string;
    discountValue?: number;
    discountAmount?: number;
  };
  couponDiscount?: number;
  shippingFee: number;
  tax?: number;
  grandTotal?: number;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod: string;
  paymentStatus?: string;
  createdAt: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderType | null>(null);
  const [dbSettings, setDbSettings] = useState<{ storeName?: string; contactAddress?: string; contactPhone?: string; contactEmail?: string; } | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // 1. Loading Order Details (via our tracking API)
    const fetchOrder = async () => {
      try {
        const res = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        if (res.ok) setOrder(await res.json());

        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) setDbSettings(await settingsRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrder();
  }, [orderId]);

  const orderNumber = order?.orderNumber || (order ? `#${order._id.substring(18)}` : "");
  const invoiceNumber = order?.invoiceNumber || (order ? `INV-${order._id.substring(18)}` : "");

  const subtotal = order
    ? (typeof order.subtotal === "number"
      ? order.subtotal
      : order.items.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0))
    : 0;

  const totalProductDiscount = order
    ? (typeof order.totalProductDiscount === "number"
      ? order.totalProductDiscount
      : order.items.reduce((sum, item) => sum + ((item.productDiscount || (item.discountPrice ? (item.price - item.discountPrice) : 0)) * item.quantity), 0))
    : 0;

  const couponDiscount = order
    ? (typeof order.couponDiscount === "number"
      ? order.couponDiscount
      : (order.discountAmount || 0))
    : 0;

  const shippingFee = order?.shippingFee || 0;
  const tax = order?.tax || 0;
  const grandTotal = order
    ? (typeof order.grandTotal === "number"
      ? order.grandTotal
      : order.totalAmount)
    : 0;

  const displayCouponCode = order?.coupon?.code || order?.couponCode || "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 print:bg-white print:p-0">
      
      {/* NORMAL BROWSER VIEW (print:hidden hides this when printing) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full text-center space-y-6 print:hidden">
        <span className="text-5xl">🎉</span>
        <h1 className="text-3xl font-extrabold text-gray-900">Thank You!</h1>
        <p className="text-green-600 font-semibold">Your order has been placed successfully.</p>
        
        {orderId && (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-xs text-gray-500 uppercase">Order ID</p>
            <p className="font-mono text-sm font-bold text-gray-800">{orderId}</p>
          </div>
        )}

        <p className="text-sm text-gray-500">
          We have sent a detailed invoice to your email address. You can also print your receipt below.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          {order && (
            <button
              onClick={() => window.print()}
              className="bg-gray-100 hover:bg-gray-200 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition"
            >
              Print Receipt 🖨️
            </button>
          )}
          <Link
            href="/"
            className="block bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition text-center"
          >
            Continue Shop
          </Link>
        </div>
      </div>

      {/* ⚡ CUSTOMER PRINT-FRIENDLY RECEIPT (only visible when printed) ⚡ */}
      {order && (
        <div className="hidden print:block absolute inset-0 bg-white text-black p-10 space-y-8 text-sm font-sans w-[210mm] h-[297mm]">
          <div className="flex justify-between items-start border-b-2 border-black pb-5">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider">{dbSettings?.storeName || "THE STORE"}</h1>
              <p className="text-xs text-gray-500 mt-1 uppercase">Luxury Perfumes & Cosmetics</p>
              <p className="text-xs text-gray-500">{dbSettings?.contactAddress}</p>
              <p className="text-xs text-gray-500">📞 {dbSettings?.contactPhone} | ✉ {dbSettings?.contactEmail}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">ORDER RECEIPT</h2>
              <p className="text-xs text-gray-400 mt-1">Invoice No: <span className="font-mono">{invoiceNumber}</span></p>
              <p className="text-xs text-gray-400">Order No: <span className="font-mono">{orderNumber}</span></p>
              <p className="text-xs text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 bg-gray-50 p-5 rounded-xl border">
            <div>
              <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Billed To:</h3>
              <p className="font-bold text-gray-900">{order.customer.name}</p>
              <p className="text-gray-600 mt-0.5">Phone: {order.customer.phone || "N/A"}</p>
              <p className="text-gray-600 leading-relaxed mt-1">{order.customer.address}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Payment Details:</h3>
              <p>• Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Bank Transfer"}</strong></p>
              <p>• Status: <strong>{order.paymentStatus || (order.paymentMethod === "COD" ? "Pending (Pay on Delivery)" : "Paid")}</strong></p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100 font-bold uppercase">
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Discount</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const itemOriginalPrice = typeof item.originalPrice === "number" ? item.originalPrice : item.price;
                const itemProductDiscount = typeof item.productDiscount === "number" ? item.productDiscount : (item.discountPrice ? (item.price - item.discountPrice) : 0);
                const itemFinalPrice = typeof item.finalPrice === "number" ? item.finalPrice : (item.discountPrice || item.price);
                const itemTotal = typeof item.total === "number" ? item.total : (itemFinalPrice * item.quantity);

                return (
                  <tr key={item._id} className="border-b">
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      {item.sku && <p className="text-[10px] text-gray-400">SKU: {item.sku}</p>}
                      {(item.size || item.color) && (
                        <p className="text-[10px] text-gray-400">
                          {[item.size, item.color].filter(Boolean).join(" / ")}
                        </p>
                      )}
                      {item.description && <p className="text-[10px] text-gray-400 whitespace-pre-line mt-1">{item.description}</p>}
                    </td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">LKR {itemOriginalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right text-red-600">{itemProductDiscount > 0 ? `-LKR ${itemProductDiscount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : "-"}</td>
                    <td className="p-3 text-right font-bold">LKR {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end pt-4">
            <div className="w-1/3 text-xs space-y-1.5 text-gray-600 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>LKR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
              {totalProductDiscount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Product Discount:</span>
                  <span>-LKR {totalProductDiscount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Coupon Discount {displayCouponCode ? `(${displayCouponCode})` : ""}:</span>
                  <span>-LKR {couponDiscount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shippingFee === 0 ? "FREE" : `LKR ${shippingFee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>LKR {tax.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-gray-900 border-t pt-2">
                <span>Grand Total:</span>
                <span>LKR {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 text-center text-xs text-gray-400 italic">
            Thank you for shopping with {dbSettings?.storeName || "THE STORE"}! We hope to see you again soon.
          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="text-center py-20 text-gray-500">Loading success details...</p>}>
      <SuccessContent />
    </Suspense>
  );
}