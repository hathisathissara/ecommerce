// src/app/admin/newsletter/page.tsx
"use client";

import { useState, useEffect } from "react";

interface SubscriberType {
  _id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<SubscriberType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      if (res.ok) setSubscribers(await res.json());
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchSubscribers(); };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;

    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((sub) => sub._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete subscriber", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Newsletter Subscribers</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage store newsletter subscribers and export contacts lists.</p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm font-medium text-gray-400 animate-pulse">Loading subscribers...</p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">Subscribed Emails ({subscribers.length})</h2>
            <p className="text-xs text-gray-400 mt-1">Review guest mailing list database registrations.</p>
          </div>
          
          {subscribers.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No subscribers yet.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Subscribed Date</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3.5 font-semibold text-gray-950">{sub.email}</td>
                      <td className="p-3.5 text-gray-500 font-medium">{new Date(sub.createdAt).toLocaleDateString()}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 text-red-600 px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}