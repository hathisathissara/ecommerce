// src/components/CartIcon.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const { cartCount, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      aria-label="Open cart"
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
    >
      {/* Shopping bag SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-gray-800"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
        />
      </svg>

      {/* Count badge */}
      <span
        className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-200 ${
          mounted && cartCount > 0
            ? "bg-gray-900 text-white scale-100"
            : "bg-gray-900 text-white scale-100"
        }`}
      >
        {mounted ? cartCount : 0}
      </span>
    </button>
  );
}