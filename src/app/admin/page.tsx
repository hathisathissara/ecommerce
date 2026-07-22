// src/app/admin/page.tsx
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Link from "next/link";

export const revalidate = 5;

export default async function AdminDashboard() {
  await connectDB();

  const productCount = await Product.countDocuments();
  const categoryCount = await Category.countDocuments();
  const orderCount = await Order.countDocuments();
  const pendingOrdersCount = await Order.countDocuments({ status: "Pending" });

  const completedOrders = await Order.find({ status: { $ne: "Cancelled" } });
  const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

  const stats = [
    { name: "Total Revenue", count: `LKR ${totalRevenue.toLocaleString()}`, href: "/admin/orders", icon: "💰" },
    { name: "Total Orders", count: orderCount.toLocaleString(), href: "/admin/orders", icon: "📦" },
    { name: "Pending Orders", count: pendingOrdersCount.toLocaleString(), href: "/admin/orders", icon: "⏳" },
    { name: "Total Products", count: productCount.toLocaleString(), href: "/admin/products", icon: "🛍️" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Monitor your store metrics, sales status, and recent customer orders.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="block group">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 group-hover:border-gray-950 transition duration-200 flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {stat.name}
                </span>
                <span className="block text-xl sm:text-2xl font-black text-gray-900">
                  {stat.count}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl group-hover:bg-gray-900 group-hover:text-white transition duration-200">
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Panel */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-gray-500 hover:text-gray-950 font-bold uppercase tracking-wider hover:underline"
            >
              View All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/75 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-3">Customer</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order._id.toString()} className="hover:bg-gray-50/50 transition">
                      <td className="p-3 font-semibold text-gray-900">{order.customer.name}</td>
                      <td className="p-3 text-gray-500 font-medium">
                        {order.paymentMethod === "COD" ? "💵 Cash" : "🏦 Bank"}
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        LKR {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-base sm:text-lg font-black text-gray-900 border-b border-gray-100 pb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { label: "Products", href: "/admin/products", emoji: "🛍️" },
              { label: "Categories", href: "/admin/categories", emoji: "📂" },
              { label: "Gift Boxes", href: "/admin/boxes", emoji: "🎁" },
              { label: "Banners", href: "/admin/banners", emoji: "🖼️" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-gray-50 hover:bg-gray-900 hover:text-white p-4.5 rounded-2xl border border-gray-100 text-center transition-all duration-200 block space-y-1.5"
              >
                <span className="block text-2xl">{action.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-inherit">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}