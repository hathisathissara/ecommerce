// src/app/admin/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Processing" | "Shipped" | "Cancelled">("All");
  const router = useRouter(); // redirection සඳහා

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // dynamic filtering
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "All" ? true : order.status === activeTab;
    const matchesName = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhone = order.customer.phone.includes(searchTerm);
    const matchesId = order._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && (matchesName || matchesPhone || matchesId);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Title & Search bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Orders 📦</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Review orders list, check bank slips, and handle status updates.</p>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, Phone or Order ID..."
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-gray-900 w-full sm:w-64 bg-white text-gray-900"
          />
        </div>

        {/* ⚡ FULL-WIDTH ORDERS LIST TABLE ⚡ */}
        {loading ? (
          <p className="text-center py-20 text-gray-500 text-sm">Loading orders...</p>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-3">
              <h2 className="text-lg font-bold text-gray-900">All Orders ({filteredOrders.length})</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
              {(["All", "Pending", "Processing", "Shipped", "Cancelled"] as const).map((tab) => {
                const count = tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      isSelected ? "bg-black text-white border-black" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    <span>
                      {tab === "All" ? "All" :
                       tab === "Pending" ? "Pending ⏳" :
                       tab === "Processing" ? "Processing ⚙️" :
                       tab === "Shipped" ? "Shipped 🚚" : "Cancelled ❌"}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-12 text-sm">No matching orders found.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Placed Date</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50/50 transition cursor-pointer"
                        // ⚡ Row එකක් Click කළ සැනින් dynamic details page එකට යවයි ⚡
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                      >
                        <td className="p-4 font-mono font-bold text-gray-500">#{order._id.substring(18)}</td>
                        <td className="p-4 font-bold text-gray-900">{order.customer.name}</td>
                        <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-500">{order.paymentMethod === "COD" ? "💵 COD" : "🏦 Bank"}</td>
                        <td className="p-4 font-bold text-gray-900">LKR {order.totalAmount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                            order.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                            order.status === "Processing" ? "bg-blue-100 text-blue-700" :
                            order.status === "Shipped" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xs bg-gray-100 text-gray-800 hover:bg-black hover:text-white px-3 py-1.5 rounded-xl font-bold transition">
                            View Details ➔
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}