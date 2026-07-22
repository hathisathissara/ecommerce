// src/app/admin/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface CategoryType {
  _id: string;
  name: string;
  image: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchCategories(); };
    init();
  }, []);

  const handleEditClick = (category: CategoryType) => {
    setIsEditing(true);
    setEditingCategoryId(category._id);
    setName(category.name);
    setExistingImage(category.image);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCategoryId("");
    setName("");
    setImageFile(null);
    setExistingImage("");
    setError("");
    const fileInput = document.getElementById("category-image") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure? Deleting this category will delete its image too.")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
        if (editingCategoryId === id) handleCancelEdit();
      }
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Please fill in the category name");
      return;
    }

    if (!isEditing && !imageFile) {
      setError("Please select a category image");
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

      const apiUrl = "/api/admin/categories";
      const apiMethod = isEditing ? "PUT" : "POST";

      const categoryRes = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: isEditing ? editingCategoryId : undefined,
          name,
          image: finalImageUrl,
        }),
      });

      if (categoryRes.ok) {
        handleCancelEdit();
        fetchCategories();
      } else {
        const data = await categoryRes.json();
        setError(data.error || "Failed to save category");
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
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Categories</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Add, update, or remove category listings for product segmentation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add / Edit Form Card */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              {isEditing ? "Edit Category" : "Add New Category"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Specify name and header graphics for store home.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-semibold">
              ⚠️ {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Category Name
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
                Category Image {isEditing ? "(Optional)" : ""}
              </label>
              <input
                id="category-image"
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
                {loading ? "Saving..." : isEditing ? "Update" : "Add Category"}
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

        {/* Categories List Table with Actions */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">Existing Categories</h2>
            <p className="text-xs text-gray-400 mt-1">Review active product collections.</p>
          </div>

          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No categories added yet.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-3.5">Image</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50 flex-shrink-0">
                          <Image
                            src={category.image}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">{category.name}</td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(category)}
                            className="bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category._id)}
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