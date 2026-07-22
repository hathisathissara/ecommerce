// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exclude sidebar and header for the Login Page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Categories", href: "/admin/categories", icon: "📂" },
    { name: "Brands", href: "/admin/brands", icon: "🏷️" },
    { name: "Products", href: "/admin/products", icon: "🛍️" },
    { name: "Gift Boxes", href: "/admin/boxes", icon: "🎁" },
    { name: "Coupons", href: "/admin/coupons", icon: "🎟️" },
    { name: "Banners", href: "/admin/banners", icon: "🖼️" },
    { name: "Orders", href: "/admin/orders", icon: "📦" },
    { name: "Reviews", href: "/admin/reviews", icon: "⭐" },
    { name: "Messages", href: "/admin/contact", icon: "💬" },
    { name: "Subscribers", href: "/admin/newsletter", icon: "✉️" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation Panel (Responsive Drawer & Desktop Sidebar) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <Link
              href="/admin"
              className="text-lg font-black tracking-widest text-gray-900 uppercase"
            >
              Admin Panel
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-950 transition"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          
          <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="uppercase tracking-wider">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Control */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition duration-200 flex items-center justify-center gap-2"
        >
          Logout <span>➔</span>
        </button>
      </aside>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        
        {/* Header Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition"
              aria-label="Open menu"
            >
              <span className="w-5 h-0.5 bg-gray-600 rounded-full" />
              <span className="w-5 h-0.5 bg-gray-600 rounded-full" />
              <span className="w-5 h-0.5 bg-gray-600 rounded-full" />
            </button>
            <span className="font-bold text-gray-900 text-base hidden md:inline">Dashboard</span>
            <span className="font-bold text-gray-900 text-base md:hidden">Admin Portal</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200">
              A
            </div>
            <span className="text-xs font-bold text-gray-500 hidden sm:inline">Hello, Administrator</span>
          </div>
        </header>

        {/* Dynamic Page Component Outlet */}
        <main className="flex-grow overflow-y-auto bg-gray-50/50">
          {children}
        </main>
      </div>

    </div>
  );
}