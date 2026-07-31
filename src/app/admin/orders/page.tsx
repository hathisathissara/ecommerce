// src/app/admin/orders/page.tsx
"use client";

import { useState, useEffect } from "react";

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Store Settings (බිල්පතේ පින්ට් කිරීමට)
  const [dbSettings, setDbSettings] = useState<{ storeName?: string; contactAddress?: string; contactPhone?: string; contactEmail?: string; } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) setOrders(await res.json());
      
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) setDbSettings(await settingsRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchOrders(), 0);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: data.order.status } : o)));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: data.order.status } : null);
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesName = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhone = order.customer.phone.includes(searchTerm);
    const matchesId = order._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesName || matchesPhone || matchesId;
  });

  return (
    // ⚡ print:hidden මඟින් පින්ට් කරද්දී මුළු පිටුවම හයිඩ් කරයි ⚡
    <div className="min-h-screen bg-gray-50 p-8 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto print:hidden">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Orders 📦</h1>

        {loading ? (
          <p className="text-center py-20 text-gray-500">Loading orders...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-900">All Orders ({filteredOrders.length})</h2>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Name, Phone or Order ID..."
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-black w-full sm:w-64 bg-white text-gray-900"
                />
              </div>

              {filteredOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-12 text-sm">No matching orders found.</p>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 border rounded-xl cursor-pointer transition flex justify-between items-center ${selectedOrder?._id === order._id ? "border-black bg-gray-50" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <div>
                        <p className="font-bold text-sm text-gray-800">{order.customer.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {order._id.substring(15)}... | {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs font-semibold text-gray-600 mt-2">LKR {order.totalAmount} | {order.paymentMethod === "COD" ? "💵 COD" : "🏦 Bank"} | 📞 {order.customer.phone}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        order.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        order.status === "Processing" ? "bg-blue-100 text-blue-700" :
                        order.status === "Shipped" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Order View */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                {selectedOrder && (
                  /* 🖨️ PRINT INVOICE BUTTON */
                  <button
                    onClick={() => window.print()}
                    className="bg-black text-white hover:bg-gray-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Print Invoice</span> <span>🖨️</span>
                  </button>
                )}
              </div>
              
              {selectedOrder ? (
                <div className="space-y-6 text-sm">
                  {/* Status Changer */}
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Update Status</label>
                    <select
                      value={selectedOrder.status}
                      disabled={updating}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white font-medium focus:ring-2 focus:ring-black outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider mb-2">Customer Info</h3>
                    <p className="font-semibold text-gray-900">{selectedOrder.customer.name}</p>
                    <p className="text-gray-500 text-xs">Email: {selectedOrder.customer.email} | Phone: {selectedOrder.customer.phone}</p>
                    <p className="text-gray-500 text-xs mt-1">Address: {selectedOrder.customer.address}</p>
                  </div>

                  {/* Items list */}
                  <div>
                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider mb-2">Items Ordered</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item._id} className="flex gap-3 border-b pb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt="" className="w-10 h-10 object-cover rounded border" />
                          <div className="flex-grow">
                            <p className="font-semibold text-xs text-gray-800 line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-gray-400">Qty: {item.quantity} | LKR {item.price}</p>
                            {item.description && (
                              <p className="text-[10px] bg-pink-50 text-pink-700 p-1.5 rounded mt-1 whitespace-pre-line">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bank Slip */}
                  {selectedOrder.paymentMethod === "BankTransfer" && selectedOrder.bankSlip && (
                    <div>
                      <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider mb-2">Bank Slip</h3>
                      <a href={selectedOrder.bankSlip} target="_blank" rel="noreferrer" className="block border rounded-xl overflow-hidden hover:opacity-90 transition">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedOrder.bankSlip} alt="Bank Slip" className="w-full h-32 object-cover" />
                        <p className="text-center text-[10px] bg-gray-50 py-1 font-semibold text-gray-600">Click to view full image</p>
                      </a>
                    </div>
                  )}

                  {/* Bill Summary */}
                  <div className="border-t pt-4 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>LKR {(selectedOrder.totalAmount + (selectedOrder.discountAmount || 0) - (selectedOrder.shippingFee || 0)).toLocaleString()}</span>
                    </div>
                    {selectedOrder.discountAmount ? selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600 font-semibold">
                        <span>Discount ({selectedOrder.couponCode})</span>
                        <span>- LKR {selectedOrder.discountAmount}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span>Delivery Cost</span>
                      <span>{(!selectedOrder.shippingFee || selectedOrder.shippingFee === 0) ? "FREE" : `LKR ${selectedOrder.shippingFee}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-extrabold text-gray-900 border-t pt-2">
                      <span>Total Paid</span>
                      <span>LKR {selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-gray-400 text-center py-12">Select an order to view details.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ⚡ 100% PRINT-FRIENDLY A4 DISPATCH INVOICE (මුද්‍රණය කරන විට පමණක් මතුවේ) ⚡ */}
      {selectedOrder && (
        <div className="hidden print:block absolute inset-0 bg-white text-black p-10 space-y-8 text-sm font-sans w-[210mm] h-[297mm]">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b-2 border-black pb-5">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider">{dbSettings?.storeName || "THE STORE"}</h1>
              <p className="text-xs text-gray-500 mt-1 uppercase">Luxury Perfumes & Cosmetics</p>
              <p className="text-xs text-gray-500">{dbSettings?.contactAddress}</p>
              <p className="text-xs text-gray-500">📞 {dbSettings?.contactPhone} | ✉ {dbSettings?.contactEmail}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">INVOICE / DISPATCH SLIP</h2>
              <p className="text-xs text-gray-400 mt-1">Order ID: <span className="font-mono">{selectedOrder._id}</span></p>
              <p className="text-xs text-gray-400">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-2 gap-8 bg-gray-50 p-5 rounded-xl border">
            <div>
              <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Ship To:</h3>
              <p className="font-bold text-gray-900">{selectedOrder.customer.name}</p>
              <p className="text-gray-600 leading-relaxed mt-1">{selectedOrder.customer.address}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Payment Details:</h3>
              <p>• Method: <strong>{selectedOrder.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Bank Transfer"}</strong></p>
              <p>• Contact Phone: {selectedOrder.customer.phone}</p>
              <p>• Status: {selectedOrder.status}</p>
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
              {selectedOrder.items.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-3">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.description && <p className="text-[10px] text-gray-400 whitespace-pre-line mt-1">{item.description}</p>}
                  </td>
                  <td className="p-3 text-center font-bold">{item.quantity}</td>
                  <td className="p-3 text-right">LKR {item.price.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold">LKR {(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Billing Breakdown */}
          <div className="flex justify-end pt-4">
            <div className="w-1/3 text-xs space-y-1.5 text-gray-600 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>LKR {(selectedOrder.totalAmount + (selectedOrder.discountAmount || 0) - (selectedOrder.shippingFee || 0)).toLocaleString()}</span>
              </div>
              {selectedOrder.discountAmount ? selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Discount ({selectedOrder.couponCode}):</span>
                  <span>- LKR {selectedOrder.discountAmount}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{(!selectedOrder.shippingFee || selectedOrder.shippingFee === 0) ? "FREE" : `LKR ${selectedOrder.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 border-t pt-2">
                <span>Grand Total:</span>
                <span>LKR {selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ✂️ COURIER PACKAGE LABEL (කපා පාර්සලයේ ඇලවිය හැකි සජීවී ලේබලය) ✂️ */}
          <div className="border-t-2 border-dashed border-gray-400 pt-10 mt-10">
            <p className="text-[10px] text-gray-400 font-semibold text-center mb-4 uppercase tracking-widest">✂️ Cut along this line and attach to the parcel package ✂️</p>
            
            <div className="border-2 border-black rounded-2xl p-6 bg-white space-y-4 max-w-xl mx-auto">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-black uppercase tracking-wider">{dbSettings?.storeName || "THE STORE"}</span>
                <span className="text-xs font-bold bg-black text-white px-3 py-1 rounded-full uppercase">
                  {selectedOrder.paymentMethod === "COD" ? "💵 COD - Collect Cash" : "🏦 Bank Paid"}
                </span>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Deliver To:</span>
                <p className="text-lg font-black text-gray-900">{selectedOrder.customer.name}</p>
                <p className="text-sm font-bold text-gray-800 leading-relaxed">{selectedOrder.customer.address}</p>
                <p className="text-base font-black text-black pt-2">📞 Phone Number: {selectedOrder.customer.phone}</p>
              </div>

              {selectedOrder.paymentMethod === "COD" && (
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-red-600">Amount to Collect:</span>
                  <span className="text-lg font-black text-red-600">LKR {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}