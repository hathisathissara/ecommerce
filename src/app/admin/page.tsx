// src/app/admin/page.tsx
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 5;

export default async function AdminDashboard() {
  await connectDB();

  const productCount = await Product.countDocuments();
  const orderCount = await Order.countDocuments();
  const pendingOrdersCount = await Order.countDocuments({ status: "Pending" });
  const processingOrdersCount = await Order.countDocuments({ status: "Processing" });
  const shippedOrdersCount = await Order.countDocuments({ status: "Shipped" });
  const deliveredOrdersCount = await Order.countDocuments({ status: "Delivered" });

  const completedOrders = await Order.find({ status: { $ne: "Cancelled" } });
  const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(6);

  const lowStockProducts = await Product.find({
    $or: [
      { $expr: { $lte: ["$stock", { $ifNull: ["$lowStockAlert", 5] }] } },
      { variants: { $elemMatch: { stock: { $lte: 5 } } } }
    ]
  }).select("name stock images variants lowStockAlert").limit(8);

  const lowStockCount = lowStockProducts.length;
  const hasOutOfStock = lowStockProducts.some((p) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.some((v: { stock?: number }) => (v.stock || 0) <= 0);
    }
    return p.stock <= 0;
  });

  // Today's date for greeting
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? "Good Morning" : hours < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">

      {/* ──────────── Hero Header ──────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-gray-900/20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">{greeting} 👋</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-md">
              Monitor your store performance, track sales and inventory in real-time.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/products/new" className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition duration-200 shadow-lg shadow-white/10 flex items-center gap-2">
              <span>➕</span> Add Product
            </Link>
            <Link href="/admin/orders" className="bg-white/10 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition duration-200 flex items-center gap-2">
              <span>📦</span> Orders
            </Link>
          </div>
        </div>
      </div>


      {/* ──────────── KPI Stats Row ──────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Revenue Card - Premium Gradient */}
        <Link href="/admin/orders" className="col-span-2 lg:col-span-1 block group">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
            <div className="relative z-10 space-y-2">
              <span className="block text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Total Revenue</span>
              <span className="block text-2xl sm:text-3xl font-black text-white">LKR {totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </Link>

        {/* Total Orders */}
        <Link href="/admin/orders" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 group-hover:border-gray-300 transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02] h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">📦</div>
              <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{pendingOrdersCount} pending</span>
            </div>
            <span className="block text-2xl font-black text-gray-900">{orderCount.toLocaleString()}</span>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Orders</span>
          </div>
        </Link>

        {/* Total Products */}
        <Link href="/admin/products" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 group-hover:border-gray-300 transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02] h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg">🛍️</div>
            </div>
            <span className="block text-2xl font-black text-gray-900">{productCount.toLocaleString()}</span>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Products</span>
          </div>
        </Link>

        {/* Pending Orders */}
        <Link href="/admin/orders" className="block group">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 group-hover:border-gray-300 transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02] h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">⏳</div>
            </div>
            <span className="block text-2xl font-black text-gray-900">{pendingOrdersCount.toLocaleString()}</span>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pending Orders</span>
          </div>
        </Link>

        {/* ⚠️ Low Stock - Dynamic Pulsing Card */}
        <Link href="#low-stock-alerts" className="block group">
          <div className={`p-5 rounded-2xl border transition-all duration-300 group-hover:scale-[1.02] h-full ${
            hasOutOfStock
              ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg shadow-red-500/10 animate-pulse'
              : lowStockCount > 0
              ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 group-hover:shadow-md'
              : 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 group-hover:shadow-md'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                hasOutOfStock ? 'bg-red-200/60' : lowStockCount > 0 ? 'bg-amber-200/60' : 'bg-green-200/60'
              }`}>⚠️</div>
              {hasOutOfStock && (
                <span className="text-[9px] font-bold text-red-600 bg-red-200/60 px-2 py-0.5 rounded-full uppercase">critical</span>
              )}
            </div>
            <span className={`block text-2xl font-black ${
              hasOutOfStock ? 'text-red-700' : lowStockCount > 0 ? 'text-amber-700' : 'text-green-700'
            }`}>
              {lowStockCount > 0 ? lowStockCount : '✓ OK'}
            </span>
            <span className={`block text-[10px] font-bold uppercase tracking-widest mt-1 ${
              hasOutOfStock ? 'text-red-500' : lowStockCount > 0 ? 'text-amber-600' : 'text-green-600'
            }`}>
              {hasOutOfStock ? '🚨 Critical Stock' : 'Low Stock'}
            </span>
          </div>
        </Link>
      </div>


      {/* ──────────── Order Status Pipeline ──────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Order Pipeline</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-xl border p-4 bg-amber-50/50 border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">⏳</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Pending</span>
            </div>
            <span className="text-2xl font-black text-amber-700">{pendingOrdersCount}</span>
          </div>
          <div className="relative overflow-hidden rounded-xl border p-4 bg-blue-50/50 border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">⚙️</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Processing</span>
            </div>
            <span className="text-2xl font-black text-blue-700">{processingOrdersCount}</span>
          </div>
          <div className="relative overflow-hidden rounded-xl border p-4 bg-violet-50/50 border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🚚</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Shipped</span>
            </div>
            <span className="text-2xl font-black text-violet-700">{shippedOrdersCount}</span>
          </div>
          <div className="relative overflow-hidden rounded-xl border p-4 bg-emerald-50/50 border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">✅</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Delivered</span>
            </div>
            <span className="text-2xl font-black text-emerald-700">{deliveredOrdersCount}</span>
          </div>
        </div>
      </div>


      {/* ──────────── Main Content Grid ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ──── Left Column: Recent Orders & Stock Alerts ──── */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Recent Orders Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-sm text-white">📋</div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-gray-900">Recent Orders</h2>
                  <p className="text-[10px] text-gray-400 font-medium">Latest customer transactions</p>
                </div>
              </div>
              <Link
                href="/admin/orders"
                className="text-[10px] text-gray-500 hover:text-gray-950 font-bold uppercase tracking-widest hover:underline transition"
              >
                View All →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <span className="text-4xl">📭</span>
                <p className="text-gray-400 text-xs font-medium">No orders placed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                      <th className="p-4 pl-6">Customer</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => {
                      const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
                        Pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
                        Processing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
                        Shipped: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
                        Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
                        Cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
                      };
                      const sc = statusConfig[order.status] || statusConfig.Pending;
                      return (
                        <tr key={order._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 uppercase flex-shrink-0">
                                {order.customer.name.charAt(0)}
                              </div>
                              <span className="font-bold text-gray-900 truncate max-w-[140px]">{order.customer.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 text-gray-500 font-medium">
                              {order.paymentMethod === "COD" ? "💵" : "🏦"}
                              <span className="text-[10px]">{order.paymentMethod === "COD" ? "Cash" : "Bank"}</span>
                            </span>
                          </td>
                          <td className="p-4 font-black text-gray-900">
                            LKR {order.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 🚨 Low Stock Alerts Table */}
          <div id="low-stock-alerts" className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
            hasOutOfStock ? 'border-red-200' : 'border-gray-100'
          }`}>
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                  hasOutOfStock ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                }`}>🚨</div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-gray-900">Low Stock Alerts</h2>
                  <p className="text-[10px] text-gray-400 font-medium">Products requiring attention</p>
                </div>
              </div>
              <Link
                href="/admin/products"
                className="text-[10px] text-gray-500 hover:text-gray-950 font-bold uppercase tracking-widest hover:underline transition"
              >
                Manage Inventory →
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl mx-auto">✅</div>
                <p className="text-gray-400 text-xs font-medium">All stock levels healthy!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Current Stock</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lowStockProducts.map(prod => {
                      const threshold = prod.lowStockAlert || 5;
                      const hasVariants = prod.variants && prod.variants.length > 0;
                      const alertItems: Array<{ label: string; stock: number; isOut: boolean }> = [];

                      if (hasVariants) {
                        prod.variants.forEach((v: { size?: string; color?: string; stock?: number }) => {
                          const st = v.stock || 0;
                          if (st <= threshold) {
                            const parts = [v.size, v.color].filter(Boolean).join(' / ');
                            alertItems.push({ label: parts || 'Default', stock: st, isOut: st <= 0 });
                          }
                        });
                      } else {
                        alertItems.push({ label: 'Standard', stock: prod.stock, isOut: prod.stock <= 0 });
                      }
                      
                      if (alertItems.length === 0) return null;

                      return (
                        <tr key={prod._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm flex-shrink-0">
                                {prod.images && prod.images[0] && (
                                  <Image src={prod.images[0]} alt="" fill unoptimized className="object-cover" />
                                )}
                              </div>
                              <Link href={`/admin/products/${prod._id.toString()}/edit`} className="font-bold text-gray-900 truncate max-w-[200px] hover:underline">
                                {prod.name}
                              </Link>
                            </div>
                          </td>
                          <td className="p-4 text-gray-500 font-medium">
                            {hasVariants ? 'Variants' : 'Standard'}
                          </td>
                          <td className="p-4 font-black text-gray-900">
                            {alertItems.map(a => a.stock).join(', ')}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1.5">
                              {alertItems.map((item, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                                  item.isOut ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {item.isOut ? 'OUT' : 'LOW'} {item.label !== 'Standard' && item.label !== 'Default' ? `(${item.label})` : ''}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ──── Right Column ──── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-xs text-white">⚡</div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Products", href: "/admin/products", emoji: "🛍️", color: "from-violet-50 to-violet-100/50 border-violet-100 hover:border-violet-300" },
                { label: "Categories", href: "/admin/categories", emoji: "📂", color: "from-blue-50 to-blue-100/50 border-blue-100 hover:border-blue-300" },
                { label: "Gift Boxes", href: "/admin/boxes", emoji: "🎁", color: "from-pink-50 to-pink-100/50 border-pink-100 hover:border-pink-300" },
                { label: "Banners", href: "/admin/banners", emoji: "🖼️", color: "from-amber-50 to-amber-100/50 border-amber-100 hover:border-amber-300" },
                { label: "Coupons", href: "/admin/coupons", emoji: "🎟️", color: "from-emerald-50 to-emerald-100/50 border-emerald-100 hover:border-emerald-300" },
                { label: "Reviews", href: "/admin/reviews", emoji: "⭐", color: "from-orange-50 to-orange-100/50 border-orange-100 hover:border-orange-300" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`bg-gradient-to-br ${action.color} border p-4 rounded-xl text-center transition-all duration-200 block space-y-1.5 hover:shadow-md hover:scale-[1.03]`}
                >
                  <span className="block text-xl">{action.emoji}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest block text-gray-700">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}