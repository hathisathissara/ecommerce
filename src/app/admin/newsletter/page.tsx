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

  // Email Campaign States
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    fetchSubscribers();
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

  // ⚡ Email Campaign එක එකවර සියල්ලන්ටම යැවීමේ Logic එක ⚡
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;

    if (!confirm(`Are you sure you want to send this newsletter campaign to all ${subscribers.length} subscribers?`)) return;

    setSending(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });

      if (res.ok) {
        setSubject("");
        setContent("");
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send campaign");
      }
    } catch (err) {
      setError("Something went wrong sending campaign");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Newsletter Manager ✉️</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* වම් පැත්ත: Send Email Campaign Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border h-fit space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Send Email Campaign</h2>
            <p className="text-xs text-gray-400">සියලුම පාරිභෝගිකයින්ට එකවර අලංකාර Updates/Offers ඊමේල් මඟින් යවන්න.</p>
            
            {success && <p className="text-green-600 text-xs bg-green-50 p-2.5 rounded font-semibold">✔ Campaign sent successfully! 🎉</p>}
            {error && <p className="text-red-500 text-xs bg-red-50 p-2.5 rounded font-semibold">{error}</p>}

            <form onSubmit={handleSendCampaign} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Email Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Exclusive Weekend Sale - 20% Off! 🌸"
                  className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold mb-1">Message Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear Valued Customer,\n\nWe are excited to announce our brand new premium perfume arrivals with a limited-time 20% discount..."
                  rows={8}
                  className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-black leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending || subscribers.length === 0}
                className="w-full bg-black text-white py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {sending ? "Sending Campaign..." : `Send to All (${subscribers.length})`}
              </button>
            </form>
          </div>

          {/* දකුණු පැත්ත: List */}
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subscribed Emails ({subscribers.length})</h2>
            
            {loading ? (
              <p className="text-gray-500 text-center py-12">Loading subscribers...</p>
            ) : subscribers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No subscribers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600 font-semibold">
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Subscribed Date</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{sub.email}</td>
                        <td className="p-3 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(sub._id)}
                            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-xs font-semibold hover:bg-red-100 transition"
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

        </div>
      </div>
    </div>
  );
}