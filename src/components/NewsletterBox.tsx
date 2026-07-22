// src/components/NewsletterBox.tsx
"use client";

import { useState } from "react";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmail("");
        setMessage("Thank you for subscribing! 🎉");
      } else {
        setError(data.error || "Subscription failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl mx-auto mb-5">
            ✉
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Stay in the loop
          </h2>
          <p className="mt-3 text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Subscribe for exclusive offers, new arrivals, and beauty tips delivered straight to your inbox.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubscribe}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 bg-white"
              required
              suppressHydrationWarning
            />
            <button
              type="submit"
              disabled={loading}
              className="flex-shrink-0 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {/* Feedback */}
          {message && (
            <p className="mt-4 text-sm font-semibold text-green-600 flex items-center justify-center gap-1.5">
              <span>✅</span> {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm font-semibold text-red-500 flex items-center justify-center gap-1.5">
              <span>⚠️</span> {error}
            </p>
          )}

          <p className="mt-5 text-[11px] text-gray-400">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}