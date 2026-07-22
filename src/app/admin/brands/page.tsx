// src/app/admin/brands/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BrandType {
  _id: string;
  name: string;
  image: string;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/admin/brands");
      if (res.ok) setBrands(await res.json());
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchBrands(); };
    init();
  }, []);

  const handleEditClick = (brand: BrandType) => {
    setIsEditing(true);
    setEditingBrandId(brand._id);
    setName(brand.name);
    setExistingImage(brand.image);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingBrandId("");
    setName("");
    setImageFile(null);
    setExistingImage("");
    setError("");
    const fileInput = document.getElementById("brand-logo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure? Deleting this brand will delete its logo from Cloudinary too.")) return;

    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBrands();
        if (editingBrandId === id) handleCancelEdit();
      }
    } catch (err) {
      console.error("Failed to delete brand", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Please fill in the brand name");
      return;
    }

    if (!isEditing && !imageFile) {
      setError("Please select a brand logo");
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
        if (!uploadRes.ok) throw new Error("Logo upload failed");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const apiUrl = "/api/admin/brands";
      const apiMethod = isEditing ? "PUT" : "POST";

      const brandRes = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: isEditing ? editingBrandId : undefined,
          name,
          image: finalImageUrl,
        }),
      });

      if (brandRes.ok) {
        handleCancelEdit();
        fetchBrands();
      } else {
        const data = await brandRes.json();
        setError(data.error || "Failed to save brand");
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
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Brands</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Add, update, or remove brands for catalog association.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add / Edit Form Card */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              {isEditing ? "Edit Brand" : "Add New Brand"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Specify name and corporate brand graphic.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Brand Logo {isEditing ? "(Optional)" : ""}
              </label>
              <input
                id="brand-logo"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-500"
              />
            </div>
            
            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-gray-900 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-700 transition duration-200 disabled:opacity-60"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Add Brand"}
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

        {/* Brand List Panel */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">Existing Brands</h2>
            <p className="text-xs text-gray-400 mt-1">Review active manufacturer listings.</p>
          </div>

          {brands.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No brands added yet.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-3.5">Logo</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {brands.map((brand) => (
                    <tr key={brand._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 relative bg-white p-1 flex-shrink-0 flex items-center justify-center">
                          <div className="w-full h-full relative">
                            <Image
                              src={brand.image}
                              alt=""
                              fill
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">{brand.name}</td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(brand)}
                            className="bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(brand._id)}
                            className="bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Delete
                          </button>
                        </div>
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
  );
}