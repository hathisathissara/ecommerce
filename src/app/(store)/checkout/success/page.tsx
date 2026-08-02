// src/app/(store)/checkout/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

interface OrderType {
  _id: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: Array<{ _id: string; name: string; price: number; quantity: number; image: string; description?: string }>;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  shippingFee: number;
  paymentMethod: string;
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

  const subtotal = order?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shippingFee = order?.shippingFee || 0;
  const totalAmount = order?.totalAmount || 0;
  
  let discountAmount = order?.discountAmount || 0;
  if (discountAmount === 0 && subtotal + shippingFee > totalAmount) {
    discountAmount = subtotal + shippingFee - totalAmount;
  }

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
              <p className="text-xs text-gray-400 mt-1">Order ID: <span className="font-mono">{order._id}</span></p>
              <p className="text-xs text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 bg-gray-50 p-5 rounded-xl border">
            <div>
              <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Billed To:</h3>
              <p className="font-bold text-gray-900">{order.customer.name}</p>
              <p className="text-gray-600 leading-relaxed mt-1">{order.customer.address}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Payment Details:</h3>
              <p>• Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Bank Transfer"}</strong></p>
              <p>• Contact Phone: {order.customer.phone}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100 font-bold uppercase">
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-3">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.description && <p className="text-[10px] text-gray-400 whitespace-pre-line mt-1">{item.description}</p>}
                  </td>
                  <td className="p-3 text-center font-bold">{item.quantity}</td>
                  <td className="p-3 text-right">
                    <div>LKR {item.price.toLocaleString()}</div>
                    {discountAmount > 0 && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        Discounted: LKR {(item.price - (item.price / subtotal) * discountAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right font-bold">
                    <div>LKR {(item.price * item.quantity).toLocaleString()}</div>
                    {discountAmount > 0 && (
                      <div className="text-[10px] text-red-500 mt-0.5 font-normal">
                        - LKR {((item.price * item.quantity / subtotal) * discountAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4">
            <div className="w-1/3 text-xs space-y-1.5 text-gray-600 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>LKR {(order.totalAmount + (order.discountAmount || 0) - (order.shippingFee || 0)).toLocaleString()}</span>
              </div>
              {order.discountAmount ? order.discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Discount ({order.couponCode}):</span>
                  <span>- LKR {order.discountAmount}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{(!order.shippingFee || order.shippingFee === 0) ? "FREE" : `LKR ${order.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 border-t pt-2">
                <span>Grand Total:</span>
                <span>LKR {order.totalAmount.toLocaleString()}</span>
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