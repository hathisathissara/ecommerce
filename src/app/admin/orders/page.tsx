// src/app/admin/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface OrderType {
  _id: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: Array<{ _id: string; name: string; price: number; quantity: number; image: string; description?: string }>;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        if (data.length > 0) setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchOrders(); };
    init();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Orders</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Track and manage customer checkout receipts and fulfillment status.</p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm font-medium text-gray-400 animate-pulse">Loading orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Orders List Card */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900">Orders List ({filteredOrders.length})</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Select an item to view receipt summary details.</p>
              </div>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Name, Phone or ID..."
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-gray-900 w-full sm:w-60 bg-white text-gray-900"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-10 text-xs italic">No matching orders found.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4.5 border rounded-2xl cursor-pointer transition-all duration-200 flex justify-between items-center ${
                      selectedOrder?._id === order._id
                        ? "border-gray-900 bg-gray-50/50 shadow-sm"
                        : "border-gray-100 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <p className="font-bold text-gray-900 text-sm">{order.customer.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        ID: {order._id} &nbsp;·&nbsp; {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] font-bold text-gray-600">
                        LKR {order.totalAmount.toLocaleString()} &nbsp;·&nbsp; {order.paymentMethod === "COD" ? "💵 COD" : "🏦 Bank"} &nbsp;·&nbsp; 📞 {order.customer.phone}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === "Pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : order.status === "Processing"
                          ? "bg-blue-50 text-blue-700"
                          : order.status === "Shipped"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Order View Column */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-base sm:text-lg font-black text-gray-900 border-b border-gray-100 pb-5">Order Details</h2>
            {selectedOrder ? (
              <div className="space-y-6 text-xs sm:text-sm">
                
                {/* Status Selector */}
                <div className="bg-gray-50 p-4.5 rounded-2xl border border-gray-100 space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Update Order Status</label>
                  <select
                    value={selectedOrder.status}
                    disabled={updating}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-bold text-xs text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Customer Details */}
                <div className="space-y-2">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Customer Info</h3>
                  <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-1.5 text-xs">
                    <p className="font-bold text-gray-900">{selectedOrder.customer.name}</p>
                    <p className="text-gray-500">Email: {selectedOrder.customer.email}</p>
                    <p className="text-gray-500">Phone: {selectedOrder.customer.phone}</p>
                    <p className="text-gray-500 leading-relaxed">Address: {selectedOrder.customer.address}</p>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Items Ordered</h3>
                  <div className="space-y-3.5 divide-y divide-gray-100">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={item._id} className={`flex flex-col gap-2.5 ${idx > 0 ? "pt-3.5" : ""}`}>
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50 flex-shrink-0">
                            <Image src={item.image} alt="" fill unoptimized className="object-cover" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-bold text-xs text-gray-950 line-clamp-2">{item.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Qty: {item.quantity} &nbsp;·&nbsp; LKR {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {item.description && (
                          <div className="text-[10px] bg-pink-50/60 text-pink-800 p-2.5 rounded-lg font-medium leading-relaxed border border-pink-100 break-words">
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Slip Upload */}
                {selectedOrder.paymentMethod === "BankTransfer" && selectedOrder.bankSlip && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Bank Slip</h3>
                    <a
                      href={selectedOrder.bankSlip}
                      target="_blank"
                      rel="noreferrer"
                      className="block border border-gray-100 rounded-2xl overflow-hidden hover:opacity-90 transition relative bg-gray-50"
                    >
                      <div className="w-full h-36 relative">
                        <Image src={selectedOrder.bankSlip} alt="Bank Slip" fill unoptimized className="object-cover" />
                      </div>
                      <p className="text-center text-[10px] bg-gray-50 py-2 font-bold text-gray-500 uppercase tracking-widest border-t border-gray-100">
                        Click to view full image
                      </p>
                    </a>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="border-t border-gray-100 pt-5 space-y-2.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">
                      LKR {(selectedOrder.totalAmount + (selectedOrder.discountAmount || 0)).toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.discountAmount ? selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 font-bold">
                      <span>Discount ({selectedOrder.couponCode})</span>
                      <span>- LKR {selectedOrder.discountAmount.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between items-center text-sm sm:text-base font-black text-gray-900 border-t border-gray-100 pt-3">
                    <span>Total Paid</span>
                    <span>LKR {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-gray-400 text-center py-10 text-xs italic">Select an order to view detailed receipts.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}