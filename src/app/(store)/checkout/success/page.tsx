// src/app/(store)/checkout/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md text-center space-y-6">
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
          We will process your order soon and update you via phone/email.
        </p>

        <Link
          href="/"
          className="block bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="text-center py-20">Loading success details...</p>}>
      <SuccessContent />
    </Suspense>
  );
}