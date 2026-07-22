// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4 text-center">
      <div className="max-w-md space-y-6">
        
        {/* Minimalist 404 Visual Icon */}
        <h1 className="text-8xl font-black tracking-tighter text-gray-950 select-none animate-pulse">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-gray-800">
            Page Not Found 🔍
          </h2>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons (පිටු අතර යාමට ලින්ක්ස්) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-md"
          >
            Back to Home 🏠
          </Link>
          <Link
            href="/products"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition"
          >
            Browse Shop 🛍️
          </Link>
        </div>

      </div>
    </div>
  );
}