// src/app/admin/products/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface CategoryType { _id: string; name: string; }
interface BrandType { _id: string; name: string; }

interface VariantInputType {
  size: string;
  color: string;
  price: string;
  discountValue: string;
  discountType: "Percentage" | "Fixed";
  stock: string;
  sku: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [brands, setBrands] = useState<BrandType[]>([]);

  // ① BASIC INFO STATES
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // ② PRICING STATES
  const [price, setPrice] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState<"Percentage" | "Fixed">("Percentage");
  const [tax, setTax] = useState("");

  // ③ INVENTORY STATES
  const [stock, setStock] = useState("10");
  const [lowStockAlert, setLowStockAlert] = useState("5");
  const [stockStatus, setStockStatus] = useState("In Stock");
  const [barcode, setBarcode] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);

  // ④ VARIANTS STATES
  const [variants, setVariants] = useState<VariantInputType[]>([]);
  const [vSize, setVSize] = useState("");
  const [vColor, setVColor] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vDiscountValue, setVDiscountValue] = useState("");
  const [vDiscountType, setVDiscountType] = useState<"Percentage" | "Fixed">("Percentage");
  const [vStock, setVStock] = useState("5");
  const [vSku, setVSku] = useState("");
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  // ⑤ IMAGES
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isGiftItem, setIsGiftItem] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Loading, Error
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setFetchLoading(true);
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/brands"),
        ]);

        if (catRes.ok) setCategories(await catRes.json());
        if (brandRes.ok) setBrands(await brandRes.json());
      } catch (err) {
        console.error("Error loading data", err);
        setError("Failed to load categories/brands.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleAddVariantToList = () => {
    if (!vPrice || !vStock) return;
    const newVariant = { size: vSize, color: vColor, price: vPrice, discountValue: vDiscountValue, discountType: vDiscountType, stock: vStock, sku: vSku };
    
    if (editingVariantIndex !== null) {
      const updatedVariants = [...variants];
      updatedVariants[editingVariantIndex] = newVariant;
      setVariants(updatedVariants);
      setEditingVariantIndex(null);
    } else {
      setVariants([...variants, newVariant]);
    }
    
    setVSize(""); setVColor(""); setVPrice(""); setVDiscountValue(""); setVDiscountType("Percentage"); setVStock("5"); setVSku("");
  };

  const handleEditVariant = (idx: number) => {
    const v = variants[idx];
    setVSize(v.size);
    setVColor(v.color);
    setVPrice(v.price);
    setVDiscountValue(v.discountValue);
    setVDiscountType(v.discountType);
    setVStock(v.stock);
    setVSku(v.sku);
    setEditingVariantIndex(idx);
    
    // Scroll to variants section
    document.getElementById("variants-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEditVariant = () => {
    setEditingVariantIndex(null);
    setVSize(""); setVColor(""); setVPrice(""); setVDiscountValue(""); setVDiscountType("Percentage"); setVStock("5"); setVSku("");
  };

  const handleRemoveVariantFromList = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
    if (editingVariantIndex === idx) {
      handleCancelEditVariant();
    } else if (editingVariantIndex !== null && editingVariantIndex > idx) {
      setEditingVariantIndex(editingVariantIndex - 1);
    }
  };

  const handleRemoveExistingImage = (urlToDestroy: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== urlToDestroy));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !stock || !selectedCategory) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

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

      const tagsArray = tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(t => t !== "") : [];

      const productRes = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku: sku || undefined,
          shortDescription,
          description,
          category: selectedCategory,
          subCategory: subCategory || undefined,
          brand: selectedBrand ? selectedBrand : null,
          tags: tagsArray,
          price: Number(price),
          discountValue: discountValue ? Number(discountValue) : null,
          discountType,
          tax: tax ? Number(tax) : 0,
          stock: Number(stock),
          lowStockAlert: Number(lowStockAlert),
          stockStatus,
          barcode: barcode || undefined,
          trackInventory,
          images: finalImages,
          isGiftItem,
          variants: variants.map(v => ({
            size: v.size || undefined,
            color: v.color || undefined,
            price: Number(v.price),
            discountValue: v.discountValue ? Number(v.discountValue) : null,
            discountType: v.discountType,
            stock: Number(v.stock),
            sku: v.sku || undefined
          })),
        }),
      });

      if (productRes.ok) {
        setSuccess("Product added successfully! ✅");
        setTimeout(() => router.push("/admin/products"), 1500);
      } else {
        const prodData = await productRes.json();
        setError(prodData.error || "Failed to add product");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">

      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400 transition"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">➕ Add New Product</h1>
          <p className="text-xs text-gray-400 mt-0.5">Enter product details, pricing, variants, and images.</p>
        </div>
      </div>

      {/* Error / Success Banners */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-4 rounded-xl font-semibold flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-xs p-4 rounded-xl font-semibold flex items-center gap-2">
          {success}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ① Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">① Basic Information</h3>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none bg-white text-gray-900 focus:ring-1 focus:ring-black" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Product Code / SKU</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm uppercase outline-none focus:ring-1 focus:ring-black" placeholder="PRF-CHN-50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sub Category</label>
              <input type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" placeholder="e.g. Lip Gloss" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags (Comma-separated)</label>
              <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" placeholder="perfume, luxury" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Short Description</label>
            <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" placeholder="Brief summary..." />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-black" required>
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Brand</label>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-black">
                <option value="No Brand (Select Brand)">No Brand (Select Brand)</option>
                {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ② Pricing */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">② Pricing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Regular Price *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Discount Value</label>
              <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" placeholder="e.g. 10 or 500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "Percentage" | "Fixed")} className="w-full px-4 py-3 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-black">
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (LKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tax (Optional %)</label>
              <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" placeholder="e.g. 8" />
            </div>
          </div>
        </div>

        {/* ③ Inventory */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">③ Inventory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Stock Quantity *</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Low Stock Alert</label>
              <input type="number" value={lowStockAlert} onChange={(e) => setLowStockAlert(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Stock Status</label>
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-black">
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-Order">Pre-Order</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Barcode / UPC / EAN</label>
              <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="trackInventory" checked={trackInventory} onChange={(e) => setTrackInventory(e.target.checked)} className="w-4 h-4 text-black rounded" />
            <label htmlFor="trackInventory" className="text-xs font-bold text-gray-600">Track Inventory?</label>
          </div>
        </div>

        {/* ④ Variants */}
        <div id="variants-section" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">④ Variants Matrix</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Size</label>
              <input type="text" placeholder="e.g. S, M, 100ml" value={vSize} onChange={(e) => setVSize(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Color</label>
              <input type="text" placeholder="e.g. Black, Rose" value={vColor} onChange={(e) => setVColor(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price *</label>
              <input type="number" placeholder="Variant Price" value={vPrice} onChange={(e) => setVPrice(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock</label>
              <input type="number" placeholder="Stock" value={vStock} onChange={(e) => setVStock(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Discount Val</label>
              <input type="number" placeholder="Discount" value={vDiscountValue} onChange={(e) => setVDiscountValue(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Discount Type</label>
              <select value={vDiscountType} onChange={(e) => setVDiscountType(e.target.value as "Percentage" | "Fixed")} className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-black">
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed (LKR)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Variant SKU</label>
              <input type="text" placeholder="e.g. TS-BLK-S" value={vSku} onChange={(e) => setVSku(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm uppercase outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
          
          {editingVariantIndex !== null ? (
            <div className="flex gap-3">
              <button type="button" onClick={handleAddVariantToList} className="flex-1 bg-black text-white py-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition">
                ✓ Update Variant
              </button>
              <button type="button" onClick={handleCancelEditVariant} className="flex-1 bg-gray-50 border text-gray-900 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition">
                Cancel Edit
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleAddVariantToList} className="w-full bg-gray-50 border text-gray-900 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition">
              + Add Variant Matrix Row
            </button>
          )}

          {variants.length > 0 && (
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2 max-h-60 overflow-y-auto">
              {variants.map((v, idx) => (
                <div key={idx} className={`flex justify-between items-center text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0 ${editingVariantIndex === idx ? 'opacity-50' : 'text-gray-600'}`}>
                  <div>
                    <span className="font-semibold block">
                      • {v.size || "N/A"} / {v.color || "N/A"} - LKR {Number(v.price).toLocaleString()} (Stock: {v.stock})
                    </span>
                    {v.sku && <span className="text-[9px] text-gray-400 font-mono">SKU: {v.sku}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleEditVariant(idx)} disabled={editingVariantIndex === idx} className="text-blue-500 font-bold text-xs hover:text-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">✏️ Edit</button>
                    <button type="button" onClick={() => handleRemoveVariantFromList(idx)} className="text-red-500 font-bold text-xs hover:text-red-700 transition">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ⑤ Product Images */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">⑤ Product Images</h3>

          {existingImages.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Images (Click ✕ to delete)</label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((imgUrl, index) => (
                  <div key={index} className="relative w-20 h-20 border border-gray-200 rounded-xl overflow-hidden group">
                    <Image src={imgUrl} alt="" fill unoptimized className="object-cover" />
                    <button type="button" onClick={() => handleRemoveExistingImage(imgUrl)} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">✕ Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Upload New Images</label>
            <input id="product-images" type="file" accept="image/*" multiple onChange={(e) => setImageFiles(e.target.files)} className="w-full p-3 border rounded-xl bg-white text-sm text-gray-500" />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isGiftItem" checked={isGiftItem} onChange={(e) => setIsGiftItem(e.target.checked)} className="w-4 h-4 text-black rounded" />
            <label htmlFor="isGiftItem" className="text-xs font-bold text-gray-600">Allow in Custom Gift Builder</label>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
          <Link
            href="/admin/products"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition text-center"
          >
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition shadow-lg shadow-black/10 disabled:opacity-50">
            {loading ? "Saving..." : "Add Product"}
          </button>
        </div>

      </form>
    </div>
  );
}
