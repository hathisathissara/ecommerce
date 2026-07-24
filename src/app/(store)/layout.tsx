// src/app/(store)/layout.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartIcon from "@/components/CartIcon";
import CartDrawer from "@/components/CartDrawer";
import { useState, useEffect } from "react";

interface Settings {
  storeName: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  freeDeliveryThreshold?: number;
}

function StoreHeader({ settings }: { settings: Settings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/track-order", label: "Track Order" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md border-b border-gray-100" : "border-b border-gray-100"
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-gray-900 text-white text-center py-1.5 px-4 text-[11px] tracking-widest uppercase font-medium">
        ✨ Free Shipping on Orders Over LKR {(settings.freeDeliveryThreshold || 5000).toLocaleString()} &nbsp;|&nbsp; Premium Imports
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {settings.logo ? (
              <Image
                src={settings.logo}
                alt={settings.storeName}
                width={150}
                height={40}
                unoptimized
                priority
                className="h-9 w-auto object-contain max-w-[140px]"
              />
            ) : (
              <span className="text-lg font-black tracking-[0.15em] uppercase text-gray-900">
                {settings.storeName}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/gift-builder"
              className="ml-2 px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center gap-1.5"
            >
              <span>🎁</span> Gift Builder
            </Link>
          </nav>

          {/* Right: Cart + Hamburger */}
          <div className="flex items-center gap-2">
            <CartIcon />
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              <div className="w-5 space-y-1.5">
                <span
                  className={`block h-0.5 bg-gray-800 rounded transition-transform duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`block h-0.5 bg-gray-800 rounded transition-opacity duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block h-0.5 bg-gray-800 rounded transition-transform duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96 border-t border-gray-100" : "max-h-0"
        }`}
      >
        <nav className="px-4 py-3 bg-white space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/gift-builder"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition text-center"
          >
            🎁 Gift Builder
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    storeName: "THE STORE",
    logo: "",
    contactEmail: "info@thestore.com",
    contactPhone: "0771234567",
    contactAddress: "Colombo, Sri Lanka",
    freeDeliveryThreshold: 5000,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="flex flex-col min-h-screen bg-white text-gray-900 antialiased">
          <StoreHeader settings={settings} />

          <main className="flex-grow">{children}</main>

          <CartDrawer />

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 pt-14 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                {/* Brand */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <h3 className="font-black text-white text-xl tracking-widest uppercase mb-4">
                    {settings.storeName}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    Premium imported perfumes and cosmetics delivered across Sri Lanka.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Shop</h4>
                  <div className="space-y-2.5 text-sm">
                    <Link href="/products" className="block text-gray-400 hover:text-white transition">All Products</Link>
                    <Link href="/gift-builder" className="block text-gray-400 hover:text-white transition">Gift Box Builder</Link>
                    <Link href="/wishlist" className="block text-gray-400 hover:text-white transition">My Wishlist</Link>
                  </div>
                </div>

                {/* Help */}
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Help</h4>
                  <div className="space-y-2.5 text-sm">
                    <Link href="/track-order" className="block text-gray-400 hover:text-white transition">Track Your Order</Link>
                    <Link href="/contact" className="block text-gray-400 hover:text-white transition">Contact Us</Link>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Contact</h4>
                  <div className="space-y-2.5 text-sm text-gray-400">
                    <p>📞 {settings.contactPhone}</p>
                    <p>✉ {settings.contactEmail}</p>
                    <p>📍 {settings.contactAddress}</p>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
                <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
                <div className="flex items-center gap-1 text-gray-600">
                  <span>💳</span>
                  <span>Secure payments</span>
                  <span className="mx-2">·</span>
                  <span>🚚</span>
                  <span>Island-wide delivery</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}