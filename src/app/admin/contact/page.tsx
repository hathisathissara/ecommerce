// src/app/admin/contact/page.tsx
"use client";

import { useState, useEffect } from "react";

interface InquiryType {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<InquiryType[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
        if (data.length > 0) setSelectedInquiry(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchInquiries(); };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`/api/admin/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((inq) => inq._id !== id));
        setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch (err) {
      console.error("Failed to delete inquiry", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Customer Messages</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Review contact form inquiries, support tickets, and guest feedback.</p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm font-medium text-gray-400 animate-pulse">Loading messages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inbox List Card */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">Inbox ({inquiries.length})</h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">Select a support ticket to view.</p>
            </div>
            
            {inquiries.length === 0 ? (
              <p className="text-gray-500 text-center py-10 text-xs italic">Inbox is empty.</p>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {inquiries.map((inq) => (
                  <div
                    key={inq._id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedInquiry?._id === inq._id
                        ? "border-gray-900 bg-gray-50/50 shadow-sm"
                        : "border-gray-100 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <h4 className="font-bold text-xs text-gray-900">{inq.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 font-medium">{inq.subject}</p>
                    <span className="text-[9px] text-gray-400 block mt-1.5 font-semibold">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Viewer Card */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col justify-between">
            {selectedInquiry ? (
              <div className="space-y-6 text-xs sm:text-sm flex-grow flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-5 flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 leading-snug">{selectedInquiry.subject}</h2>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        From: <span className="text-gray-900 font-bold">{selectedInquiry.name}</span> ({selectedInquiry.email})
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/50 p-5 rounded-2xl border border-gray-100 text-xs sm:text-sm">
                    &quot;{selectedInquiry.message}&quot;
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-8">
                  <button
                    onClick={() => handleDelete(selectedInquiry._id)}
                    className="bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200"
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-grow py-20 text-gray-400 text-xs italic">
                Select a message from the inbox to read details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}