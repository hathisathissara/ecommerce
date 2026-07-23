// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface CategoryType {
  _id: string;
  name: string;
}

interface BrandType {
  _id: string;
  name: string;
}

interface VariantInputType {
  size: string;
  price: string;
  discountPrice: string;
  stock: string;
  sku: string;
}

interface ProductType {
  _id: string;
  name: string;
  sku?: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category: { _id: string; name: string };
  brand?: { _id: string; name: string };
  variants: Array<{ size: string; price: number; discountPrice?: number; stock: number; sku?: string }>;
  isGiftItem: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [brands, setBrands] = useState<BrandType[]>([]);
  
  // Form States
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isGiftItem, setIsGiftItem] = useState(false);
  
  // Variants States
  const [variants, setVariants] = useState<VariantInputType[]>([]);
  const [vSize, setVSize] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vDiscountPrice, setVDiscountPrice] = useState("");
  const [vStock, setVStock] = useState("5");
  const [vSku, setVSku] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // CRUD Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const prodRes = await fetch("/api/admin/products");
      const catRes = await fetch("/api/admin/categories");
      const brandRes = await fetch("/api/admin/brands");
      
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchData(); };
    init();
  }, []);

  const handleAddVariantToList = () => {
    if (!vSize || !vPrice || !vStock) return;
    setVariants([...variants, { size: vSize, price: vPrice, discountPrice: vDiscountPrice, stock: vStock, sku: vSku }]);
    setVSize("");
    setVPrice("");
    setVDiscountPrice("");
    setVStock("5");
    setVSku("");
  };

  const handleRemoveVariantFromList = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleEditClick = (product: ProductType) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    setName(product.name);
    setSku(product.sku || "");
    setDescription(product.description);
    setPrice(product.price.toString());
    setDiscountPrice(product.discountPrice ? product.discountPrice.toString() : "");
    setStock(product.stock.toString());
    setSelectedCategory(product.category._id);
    setSelectedBrand(product.brand ? product.brand._id : ""); // Brand එකක් නැත්නම් හිස් වේ
    setIsGiftItem(product.isGiftItem);
    setExistingImages(product.images);
    
    setVariants(
      product.variants.map((v) => ({
        size: v.size,
        price: v.price.toString(),
        discountPrice: v.discountPrice ? v.discountPrice.toString() : "",
        stock: v.stock.toString(),
        sku: v.sku || "",
      }))
    );
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Edit කරද්දී පරණ පින්තූරයක් එකින් එක ඉවත් කිරීම
  const handleRemoveExistingImage = (urlToDestroy: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== urlToDestroy));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProductId("");
    setName("");
    setSku("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setStock("10");
    setSelectedCategory("");
    setSelectedBrand("");
    setImageFiles(null);
    setIsGiftItem(false);
    setExistingImages([]);
    setVariants([]);
    setVSize("");
    setVPrice("");
    setVDiscountPrice("");
    setVStock("5");
    setVSku("");
    setError("");
    const fileInput = document.getElementById("product-images") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        if (editingProductId === id) handleCancelEdit();
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !stock || !selectedCategory) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let finalImages = [...existingImages];

      if (imageFiles && imageFiles.length > 0) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const formData = new FormData();
          formData.append("file", imageFiles[i]);
          const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
          if (!uploadRes.ok) throw new Error("Image upload failed");
          const uploadData = await uploadRes.json();
          uploadedUrls.push(uploadData.url);
        }
        finalImages = [...finalImages, ...uploadedUrls];
      }

      if (finalImages.length === 0) {
        throw new Error("Please upload at least one image.");
      }

      const url = "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";
      const productRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: isEditing ? editingProductId : undefined,
          name,
          sku: sku || undefined,
          description,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          stock: Number(stock),
          images: finalImages,
          category: selectedCategory,
          brand: selectedBrand ? selectedBrand : null, // ⚡ dynamic: brand එකක් නැත්නම් null ලෙස යවා CastError වළක්වයි ⚡
          isGiftItem,
          variants: variants.map(v => ({
            size: v.size,
            price: Number(v.price),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
            stock: Number(v.stock),
            sku: v.sku || undefined
          })),
        }),
      });

      if (productRes.ok) {
        handleCancelEdit();
        fetchData();
      } else {
        const prodData = await productRes.json();
        setError(prodData.error || "Failed to save product");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesName = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = prod.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSku = prod.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVariantSku = prod.variants?.some(v => v.sku?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesName || matchesCategory || matchesSku || matchesVariantSku;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Products</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Add, update, and manage your luxury perfume and cosmetics inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Add/Edit Card */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Specify catalog details, prices, and variants.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Product Name *
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
                  Base SKU Code
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase placeholder:normal-case"
                  placeholder="e.g. PRF-CHN-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white outline-none focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Discount
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white outline-none focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">No Brand (Select Brand)</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Variants Setup */}
            <div className="border-t border-gray-100 pt-5 space-y-3.5">
              <h3 className="font-bold text-gray-900 text-[10px] uppercase tracking-widest">
                Product Variants
              </h3>
              
              <div className="grid grid-cols-5 gap-1.5">
                <input
                  type="text"
                  placeholder="Size"
                  value={vSize}
                  onChange={(e) => setVSize(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg text-[10px] outline-none"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={vPrice}
                  onChange={(e) => setVPrice(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg text-[10px] outline-none"
                />
                <input
                  type="number"
                  placeholder="Discount"
                  value={vDiscountPrice}
                  onChange={(e) => setVDiscountPrice(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg text-[10px] outline-none"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={vStock}
                  onChange={(e) => setVStock(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg text-[10px] outline-none"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={vSku}
                  onChange={(e) => setVSku(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg text-[10px] outline-none uppercase placeholder:normal-case"
                />
              </div>

              <button
                type="button"
                onClick={handleAddVariantToList}
                className="w-full bg-gray-50 border border-gray-100 text-gray-900 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition"
              >
                + Add Variant
              </button>

              {variants.length > 0 && (
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] text-gray-600 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="font-semibold block">• {v.size} (LKR {Number(v.price).toLocaleString()} | Stock: {v.stock})</span>
                        {v.sku && <span className="text-[9px] text-gray-400 font-mono">SKU: {v.sku}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantFromList(idx)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images and Checkbox */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              
              {/* සජීවීව පරණ පින්තූර Preview කර ඉවත් කරන කොටස */}
              {isEditing && existingImages.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Current Saved Images (Click ✕ to delete)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-16 h-16 border border-gray-200 rounded-xl overflow-hidden group">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(imgUrl)}
                          className="absolute inset-0 bg-red-600/90 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 text-[10px] font-bold"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Upload New Images {isEditing ? "(Appends to current images)" : "*"}
                </label>
                <input
                  id="product-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isGiftItem"
                  checked={isGiftItem}
                  onChange={(e) => setIsGiftItem(e.target.checked)}
                  className="w-4 h-4 rounded text-gray-900 border-gray-200 outline-none focus:ring-0"
                />
                <label htmlFor="isGiftItem" className="text-xs font-bold text-gray-600">
                  Allow in Custom Gift Builder
                </label>
              </div>
            </div>

            <div className="flex gap-2.5 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-gray-900 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-700 transition duration-200 disabled:opacity-60"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Add Product"}
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

        {/* Right column: Search & Product Table */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                Products Inventory ({filteredProducts.length})
              </h2>
              <p className="text-xs text-gray-400 mt-1">Check stocks, SKUs, and manage listings.</p>
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, Category or SKU..."
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-gray-900 w-full sm:w-64 bg-white text-gray-900"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-xs italic">No matching products found.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-3.5">Image</th>
                    <th className="p-3.5">Product Info</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock Details</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50 flex-shrink-0">
                          <Image
                            src={prod.images[0]}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3.5 space-y-1">
                        <p className="font-bold text-gray-900">{prod.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-block text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            {prod.category?.name}
                          </span>
                          {/* Brand Badge display - No Brand fallback added */}
                          <span className="inline-block text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            {prod.brand?.name || "No Brand"}
                          </span>
                          {prod.sku && (
                            <span className="inline-block text-[9px] bg-gray-900/5 text-gray-600 px-1.5 py-0.5 rounded font-mono font-bold">
                              SKU: {prod.sku}
                            </span>
                          )}
                          {prod.isGiftItem && (
                            <span className="inline-block text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">
                              🎁 Gift Set
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">
                        LKR {(prod.discountPrice || prod.price).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-[11px] text-gray-500 space-y-1.5">
                        {prod.variants && prod.variants.length > 0 ? (
                          prod.variants.map((v, i) => (
                            <div key={i} className="font-semibold text-gray-600 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                              <p>• {v.size}: <span className={v.stock <= 0 ? "text-red-500 font-bold" : "text-green-600"}>{v.stock} left</span></p>
                              {v.sku && <p className="text-[9px] text-gray-400 font-mono">SKU: {v.sku}</p>}
                            </div>
                          ))
                        ) : (
                          <p className="font-semibold text-gray-600">
                            Base: <span className={prod.stock <= 0 ? "text-red-500 font-bold" : "text-green-600"}>{prod.stock} left</span>
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prod._id)}
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