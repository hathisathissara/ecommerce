// src/app/admin/orders/[id]/OrderDetailsClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface OrderType {
  _id: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: Array<{ _id: string; name: string; price: number; quantity: number; image: string; description?: string }>;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  shippingFee: number;
  paymentMethod: string;
  bankSlip?: string;
  status: "Pending" | "Processing" | "Shipped" | "Cancelled";
  createdAt: string;
}

interface OrderDetailsClientProps {
  order: OrderType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
}

export default function OrderDetailsClient({ order, settings }: OrderDetailsClientProps) {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  // The function of changing the status
  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id, status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus as OrderType["status"]);
        alert(`Order status updated to "${newStatus}"! ✅`);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = order.shippingFee || 0;
  const totalAmount = order.totalAmount || 0;
  
  let discountAmount = order.discountAmount || 0;
  if (discountAmount === 0 && subtotal + shippingFee > totalAmount) {
    discountAmount = subtotal + shippingFee - totalAmount;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 print:bg-white print:p-0">
      
      {/* Pint style sheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: auto;
            margin: 0mm !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          header, footer, nav, button, .print-hidden, aside {
            display: none !important;
          }
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}} />

      {/* BROWSER DETAILED VIEW (hidden by print:hidden when printing) */}
      <div className="max-w-4xl mx-auto space-y-6 print:hidden">
        
        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/admin/orders" className="text-xs font-bold text-gray-400 hover:text-black transition">
              ← Back to All Orders
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">Order Summary</h1>
            <p className="text-xs text-gray-400 mt-0.5">Order ID: <span className="font-mono">{order._id}</span></p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-black text-white hover:bg-gray-800 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Print Invoice</span> <span>🖨️</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left side (col-span-2): Items & Delivery Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Customer Shipping info card */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h2 className="text-sm font-black uppercase text-gray-400 border-b pb-2">Customer & Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-gray-500 uppercase">Customer Name</p>
                  <p className="font-semibold text-gray-900 mt-1 text-sm">{order.customer.name}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 uppercase">Contact Phone</p>
                  <p className="font-semibold text-gray-900 mt-1 text-sm">{order.customer.phone}</p>
                </div>
                <div className="col-span-2 border-t pt-3">
                  <p className="font-bold text-gray-500 uppercase">Delivery Address</p>
                  <p className="font-semibold text-gray-900 mt-1 text-sm leading-relaxed">{order.customer.address}</p>
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h2 className="text-sm font-black uppercase text-gray-400 border-b pb-2">Items Ordered</h2>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item._id} className="py-4 flex gap-4 items-center">
                    <Image src={item.image} alt="" width={56} height={56} className="w-14 h-14 object-cover rounded-xl border flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity} | LKR {item.price.toLocaleString()}</p>
                      {item.description && (
                        <p className="text-[10px] bg-pink-50 text-pink-700 p-2 rounded-xl mt-2 whitespace-pre-line leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    <span className="font-extrabold text-sm text-gray-900 flex-shrink-0">LKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Status Updater & Pricing Summary */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 h-fit">
            
            {/* Status changer */}
            <div className="space-y-2">
              <h2 className="text-sm font-black uppercase text-gray-400 border-b pb-2">Order Status</h2>
              <div className="bg-gray-50 p-4 rounded-xl border">
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Update Status</label>
                <select
                  value={status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-semibold focus:ring-2 focus:ring-black outline-none text-xs"
                >
                  <option value="Pending">Pending ⏳</option>
                  <option value="Processing">Processing ⚙️</option>
                  <option value="Shipped">Shipped 🚚</option>
                  <option value="Cancelled">Cancelled ❌</option>
                </select>
              </div>
            </div>

            {/* Bank Slip if BankTransfer */}
            {order.paymentMethod === "BankTransfer" && order.bankSlip && (
              <div className="space-y-2 border-t pt-4">
                <h2 className="text-sm font-black uppercase text-gray-400 border-b pb-2">Bank Slip</h2>
                <a href={order.bankSlip} target="_blank" rel="noreferrer" className="block border rounded-2xl overflow-hidden hover:opacity-90 transition">
                  <div className="relative w-full h-32">
                    <Image src={order.bankSlip} alt="Bank Slip" fill className="object-cover" />
                  </div>
                  <p className="text-center text-[10px] bg-gray-50 py-1.5 font-bold text-gray-600">Click to view full image</p>
                </a>
              </div>
            )}

            {/* Bill Summary */}
            <div className="space-y-3 border-t pt-4">
              <h2 className="text-sm font-black uppercase text-gray-400 border-b pb-2">Pricing Summary</h2>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Discount ({order.couponCode})</span>
                    <span>- LKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Cost</span>
                  <span>{shippingFee === 0 ? "FREE" : `LKR ${shippingFee}`}</span>
                </div>
                <div className="flex justify-between items-center text-base font-extrabold text-gray-900 border-t pt-3">
                  <span>Total Paid</span>
                  <span className="text-pink-600">LKR {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ⚡ 100% PRINT-FRIENDLY A4 DISPATCH INVOICE (only appears when printing) ⚡ */}
      <div className="hidden print:block print-container bg-white text-black p-10 space-y-8 text-sm font-sans w-[210mm] h-[297mm]">
        {/* Header Row */}
        <div className="flex justify-between items-start border-b-2 border-black pb-5">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">{settings?.storeName || "THE STORE"}</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase">Luxury Perfumes & Cosmetics</p>
            <p className="text-xs text-gray-500">{settings?.contactAddress}</p>
            <p className="text-xs text-gray-500">📞 {settings?.contactPhone} | ✉ {settings?.contactEmail}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase">INVOICE / DISPATCH SLIP</h2>
            <p className="text-xs text-gray-400 mt-1">Order ID: <span className="font-mono">{order._id}</span></p>
            <p className="text-xs text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-2 gap-8 bg-gray-50 p-5 rounded-xl border">
          <div>
            <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Ship To:</h3>
            <p className="font-bold text-gray-900">{order.customer.name}</p>
            <p className="text-gray-600 leading-relaxed mt-1">{order.customer.address}</p>
          </div>
          <div>
            <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Payment Details:</h3>
            <p>• Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Bank Transfer"}</strong></p>
            <p>• Contact Phone: {order.customer.phone}</p>
          </div>
        </div>

        {/* Items Table */}
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

        {/* Billing Breakdown */}
        <div className="flex justify-end pt-4">
          <div className="w-1/3 text-xs space-y-1.5 text-gray-600 text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Discount ({order.couponCode}):</span>
                <span>- LKR {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{shippingFee === 0 ? "FREE" : `LKR ${shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 border-t pt-2">
              <span>Grand Total:</span>
              <span>LKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ✂️ COURIER PACKAGE LABEL (Live label that can be cut and pasted on the parcel) ✂️ */}
        <div className="border-t-2 border-dashed border-gray-400 pt-10 mt-10">
          <p className="text-[10px] text-gray-400 font-semibold text-center mb-4 uppercase tracking-widest">✂️ Cut along this line and attach to the parcel package ✂️</p>
          
          <div className="border-2 border-black rounded-2xl p-6 bg-white space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-black uppercase tracking-wider">{settings?.storeName || "THE STORE"}</span>
              <span className="text-xs font-bold bg-black text-white px-3 py-1 rounded-full uppercase">
                {order.paymentMethod === "COD" ? "💵 COD - Collect Cash" : "🏦 Bank Paid"}
              </span>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Deliver To:</span>
              <p className="text-lg font-black text-gray-900">{order.customer.name}</p>
              <p className="text-sm font-bold text-gray-800 leading-relaxed">{order.customer.address}</p>
              <p className="text-base font-black text-black pt-2">📞 Phone Number: {order.customer.phone}</p>
            </div>

            {order.paymentMethod === "COD" && (
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-red-600">Amount to Collect:</span>
                <span className="text-lg font-black text-red-600">LKR {totalAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}