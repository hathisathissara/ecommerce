// src/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminSettings() {
  const [storeName, setStoreName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("");
  
  // Logo States
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogo, setExistingLogo] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setStoreName(data.storeName);
          setContactEmail(data.contactEmail);
          setContactPhone(data.contactPhone);
          setContactAddress(data.contactAddress);
          setBankName(data.bankName);
          setBankAccountName(data.bankAccountName);
          setBankAccountNumber(data.bankAccountNumber);
          setBankBranch(data.bankBranch);
          setDeliveryCharge(data.deliveryCharge.toString());
          setFreeDeliveryThreshold(data.freeDeliveryThreshold.toString());
          setExistingLogo(data.logo || "");
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      let logoUrl = existingLogo;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Logo upload failed");
        const uploadData = await uploadRes.json();
        logoUrl = uploadData.url;
      }

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          logo: logoUrl,
          contactEmail,
          contactPhone,
          contactAddress,
          bankName,
          bankAccountName,
          bankAccountNumber,
          bankBranch,
          deliveryCharge: Number(deliveryCharge),
          freeDeliveryThreshold: Number(freeDeliveryThreshold),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setLogoFile(null);
        const fileInput = document.getElementById("store-logo") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        const updatedData = await res.json();
        setExistingLogo(updatedData.logo || "");
      }
    } catch (err) {
      console.error("Failed to update settings", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Site Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure shop name, brand logo, support contact emails, delivery charges, and banking details.</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl font-bold">
          ✔ Settings updated successfully!
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Store Branding */}
          <div className="space-y-4">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Store Branding</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Store Logo
                </label>
                <input
                  id="store-logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-500"
                />
                
                {existingLogo && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold">Active Logo:</span>
                    <div className="h-8 w-24 relative bg-gray-50 border border-gray-100 rounded-lg overflow-hidden p-1">
                      <Image
                        src={existingLogo}
                        alt="Logo"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Store Showroom Address
                </label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Config */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Delivery Configuration (LKR)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Flat Delivery Surcharge
                </label>
                <input
                  type="number"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Free Shipping Threshold
                </label>
                <input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Bank Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-700 transition duration-200 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}