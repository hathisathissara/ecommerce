// src/app/(store)/contact/ContactFormClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface SettingsType {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

export default function ContactFormClient({ settings }: { settings: SettingsType }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit message");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Contact Us</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Contact Us
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 space-y-6">
            <h2 className="text-lg font-black text-gray-900">Get In Touch</h2>

            <div className="space-y-5 text-xs sm:text-sm text-gray-600">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Our Showroom Address 📍
                </span>
                <p className="mt-1 text-gray-950 font-medium leading-relaxed">{settings.contactAddress}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Phone & Whatsapp 📞
                </span>
                <p className="mt-1 text-gray-950 font-medium">{settings.contactPhone}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Email Address ✉
                </span>
                <p className="mt-1 text-gray-950 font-medium">{settings.contactEmail}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-gray-900">Send Us a Message</h2>

            {success && (
              <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl font-bold">
                ✔ Thank you! Your message has been sent successfully. We will get back to you shortly.
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-bold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Inquiry about product size"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Write your message here..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3.5 rounded-xl text-sm transition duration-200 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}