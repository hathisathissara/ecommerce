// src/app/admin/banners/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BannerType {
  _id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) setBanners(await res.json());
    } catch (err) {
      console.error("Failed to fetch banners", err);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchBanners(); };
    init();
  }, []);

  const handleEditClick = (banner: BannerType) => {
    setIsEditing(true);
    setEditingBannerId(banner._id);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setLink(banner.link || "");
    setExistingImage(banner.image);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingBannerId("");
    setTitle("");
    setSubtitle("");
    setLink("");
    setImageFile(null);
    setExistingImage("");
    setError("");
    const fileInput = document.getElementById("banner-image") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure? Deleting this banner will delete its image from Cloudinary too.")) return;

    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBanners();
        if (editingBannerId === id) handleCancelEdit();
      }
    } catch (err) {
      console.error("Failed to delete banner", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && !imageFile) {
      setError("Please select a banner image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let finalImageUrl = existingImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const apiUrl = "/api/admin/banners";
      const apiMethod = isEditing ? "PUT" : "POST";

      const bannerRes = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerId: isEditing ? editingBannerId : undefined,
          title,
          subtitle,
          image: finalImageUrl,
          link,
        }),
      });

      if (bannerRes.ok) {
        handleCancelEdit();
        fetchBanners();
      } else {
        const data = await bannerRes.json();
        setError(data.error || "Failed to save banner");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Banners</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure homepage hero slides and promotional banners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              {isEditing ? "Edit Banner" : "Add New Banner"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Provide graphics, headlines, and call-to-action redirects.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Banner Image {isEditing ? "(Optional)" : "*"}
              </label>
              <input
                id="banner-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Main Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g. Summer Mega Sale!"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g. Get up to 50% Off"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Button Link
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g. /products?category=perfumes"
              />
            </div>
            
            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-gray-900 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-700 transition duration-200 disabled:opacity-60"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Add Banner"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="border border-gray-200 text-gray-700 px-4 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Banners */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">Existing Banners</h2>
            <p className="text-xs text-gray-400 mt-1">Review active storefront slider items.</p>
          </div>

          {banners.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No banners added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <div key={banner._id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col justify-between hover:border-gray-900 transition duration-300">
                  <div className="aspect-[2/1] w-full relative bg-gray-50 border-b border-gray-100">
                    <Image
                      src={banner.image}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 flex-grow space-y-2">
                    <h3 className="font-bold text-sm text-gray-900">{banner.title || "Untitled Banner"}</h3>
                    <p className="text-xs text-gray-400 font-semibold">{banner.subtitle || "No Subtitle"}</p>
                    {banner.link && (
                      <p className="text-[10px] text-gray-400 font-mono">
                        Target Link: <span className="text-gray-900 font-semibold underline">{banner.link}</span>
                      </p>
                    )}
                  </div>
                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => handleEditClick(banner)}
                      className="flex-1 bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-100 py-2 rounded-xl text-xs font-bold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(banner._id)}
                      className="flex-1 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 text-red-600 py-2 rounded-xl text-xs font-bold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}