// src/app/(store)/unsubscribe/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email"); // URL එකෙන් ?email= අගය කියවා ගනී [1]

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // දායකත්වයෙන් ඉවත් වීමේ පොදු Function එක
  const triggerUnsubscribe = async (emailToUnsub: string) => {
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUnsub }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(data.error || "Failed to unsubscribe.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) triggerUnsubscribe(email);
  };

  // ⚡ URL එකේ Email එකක් ඇත්නම් සර්වර් එක ලෝඩ් වෙද්දීම ඔටෝම Unsubscribe කරයි ⚡
  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      triggerUnsubscribe(emailFromQuery); // ඔටෝම unsubscribe ක්‍රියාවලිය සිදුවේ
    }
  }, [emailFromQuery]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full text-center space-y-6">
        <span className="text-4xl">✉️</span>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Unsubscribe from Newsletter</h1>
        
        {loading && (
          <div className="space-y-2 py-8">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Processing your unsubscribe request...</p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-green-600 font-semibold">✔ You have been successfully unsubscribed.</p>
            <p className="text-xs text-gray-400">We are sorry to see you go. You will no longer receive any update or offer emails from us.</p>
            <Link
              href="/"
              className="block bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition text-xs"
            >
              Return to Storefront
            </Link>
          </div>
        )}

        {!loading && !success && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">දායකත්වයෙන් ඉවත් වීමට පහතින් ඔබගේ Email ලිපිනය තහවුරු කරන්න.</p>
            {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded">{error}</p>}

            <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none text-sm text-gray-900 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!email}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition"
              >
                Unsubscribe ➔
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js 15 URL query parsing protection [1]
export default function UnsubscribePage() {
  return (
    <Suspense fallback={<p className="text-center py-20 text-gray-500">Loading Unsubscribe Page...</p>}>
      <UnsubscribeContent />
    </Suspense>
  );
}