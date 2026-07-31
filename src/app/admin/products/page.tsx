// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

interface ProductType {
  _id: string;
  name: string;
  sku?: string;
  shortDescription?: string;
  description: string;
  category: { _id: string; name: string };
  subCategory?: string;
  brand?: { _id: string; name: string };
  tags: string[];
  price: number;
  discountValue: number;
  discountType: "Percentage" | "Fixed";
  discountPrice?: number;
  tax?: number;
  stock: number;
  lowStockAlert: number;
  stockStatus: string;
  barcode?: string;
  trackInventory: boolean;
  variants: Array<{ size?: string; color?: string; price: number; discountValue?: number; discountType?: string; discountPrice?: number; stock: number; sku?: string }>;
  images: string[];
  isGiftItem: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
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

  // ⑤ IMAGES
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isGiftItem, setIsGiftItem] = useState(false);

  // Pop-up Modal Open/Close State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search, Loading, Editing
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const prodRes = await fetch("/api/admin/products");
      const catRes = await fetch("/api/admin/categories");
      const brandRes = await fetch("/api/admin/brands");
      
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchData(), 0);
  }, []);

  const handleAddVariantToList = () => {
    if (!vPrice || !vStock) return;
    setVariants([
      ...variants, 
      { size: vSize, color: vColor, price: vPrice, discountValue: vDiscountValue, discountType: vDiscountType, stock: vStock, sku: vSku }
    ]);
    setVSize(""); setVColor(""); setVPrice(""); setVDiscountValue(""); setVDiscountType("Percentage"); setVStock("5"); setVSku("");
  };

  const handleRemoveVariantFromList = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleEditClick = (product: ProductType) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    
    // ① Basic Info
    setName(product.name);
    setSku(product.sku || "");
    setShortDescription(product.shortDescription || "");
    setDescription(product.description);
    setSelectedCategory(product.category._id);
    setSubCategory(product.subCategory || "");
    setSelectedBrand(product.brand ? product.brand._id : "");
    setTagsInput(product.tags ? product.tags.join(", ") : "");

    // ② Pricing
    setPrice(product.price.toString());
    setDiscountValue(product.discountValue ? product.discountValue.toString() : "");
    setDiscountType(product.discountType || "Percentage");
    setTax(product.tax ? product.tax.toString() : "");

    // ③ Inventory
    setStock(product.stock.toString());
    setLowStockAlert(product.lowStockAlert ? product.lowStockAlert.toString() : "5");
    setStockStatus(product.stockStatus || "In Stock");
    setBarcode(product.barcode || "");
    setTrackInventory(product.trackInventory !== false);

    // ④ Variants
    setVariants(
      product.variants.map((v) => ({
        size: v.size || "",
        color: v.color || "",
        price: v.price.toString(),
        discountValue: v.discountValue ? v.discountValue.toString() : "",
        discountType: (v.discountType === "Fixed" ? "Fixed" : "Percentage"),
        stock: v.stock.toString(),
        sku: v.sku || "",
      }))
    );

    // ⑤ Images
    setIsGiftItem(product.isGiftItem || false);
    setExistingImages(product.images);
    
    setError("");
    setIsModalOpen(true);
  };

  // ⚡ අතුරුදහන් වී තිබූ handleRemoveExistingImage function එක මෙතැනට ඇතුලත් කරන ලදී ⚡
  const handleRemoveExistingImage = (urlToDestroy: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== urlToDestroy));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProductId("");
    
    // Reset all
    setName(""); setSku(""); setShortDescription(""); setDescription(""); setSelectedCategory(""); setSubCategory(""); setSelectedBrand(""); setTagsInput("");
    setPrice(""); setDiscountValue(""); setDiscountType("Percentage"); setTax("");
    setStock("10"); setLowStockAlert("5"); setStockStatus("In Stock"); setBarcode(""); setTrackInventory(true);
    setVariants([]); setVSize(""); setVColor(""); setVPrice(""); setVDiscountValue(""); setVDiscountType("Percentage"); setVStock("5"); setVSku("");
    setImageFiles(null); setIsGiftItem(false); setExistingImages([]);
    setError("");
    setIsModalOpen(false);
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

      const tagsArray = tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(t => t !== "") : [];

      const url = "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";
      const productRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: isEditing ? editingProductId : undefined,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Products 🛍️</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure catalogs, dynamic variants, prices, and stock inventory.</p>
        </div>
        
        {/* Add New Product Button */}
        <button
          onClick={() => { handleCancelEdit(); setIsModalOpen(true); }}
          className="bg-black text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition duration-200 shadow-sm flex items-center gap-2"
        >
          <span>Add New Product</span> <span className="text-sm">➕</span>
        </button>
      </div>

      {/* Pop-up Modal (Add / Edit Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={handleCancelEdit} />

          {/* Modal Container */}
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden relative z-10">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-black text-gray-900">{isEditing ? "✏️ Edit Product Details" : "➕ Add New Product"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Specify catalog details, pricing, variants, and images.</p>
              </div>
              <button onClick={handleCancelEdit} className="text-gray-500 hover:text-black font-bold text-lg p-2">✕</button>
            </div>
            {error && (
              <div className="bg-red-50 border-b border-red-100 text-red-600 text-xs p-3 font-semibold text-center">
                ⚠️ {error}
              </div>
            )}

            {/* Modal Body (2-Column Scrollable Form Grid) */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              
              {/* Left Column: Basic Info & Images */}
              <div className="space-y-6">
                {/* ① Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-1.5">① Basic Information</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-white text-gray-900 focus:ring-1 focus:ring-black" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Product Code / SKU</label>
                      <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs uppercase outline-none focus:ring-1 focus:ring-black" placeholder="PRF-CHN-50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sub Category</label>
                      <input type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" placeholder="e.g. Lip Gloss" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Short Description</label>
                    <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" placeholder="Brief summary..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Description *</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-black" required>
                        <option value="">Select Category</option>
                        {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Brand</label>
                      <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-black">
                        <option value="">No Brand (Select Brand)</option>
                        {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags (Comma-separated)</label>
                    <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" placeholder="perfume, luxury, Dior" />
                  </div>
                </div>

                {/* ⑤ Product Images */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-1.5">⑤ Product Images</h3>
                  
                  {isEditing && existingImages.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Images (Click ✕ to delete)</label>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((imgUrl, index) => (
                          <div key={index} className="relative w-14 h-14 border border-gray-200 rounded-lg overflow-hidden group">
                            <Image src={imgUrl} alt="" fill unoptimized className="object-cover" />
                            <button type="button" onClick={() => handleRemoveExistingImage(imgUrl)} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">✕ Remove</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Images *</label>
                    <input id="product-images" type="file" accept="image/*" multiple onChange={(e) => setImageFiles(e.target.files)} className="w-full p-2 border rounded-xl bg-white text-xs text-gray-500" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isGiftItem" checked={isGiftItem} onChange={(e) => setIsGiftItem(e.target.checked)} className="w-4 h-4 text-black rounded" />
                    <label htmlFor="isGiftItem" className="text-xs font-bold text-gray-600">Allow in Custom Gift Builder</label>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing, Inventory, & Variants */}
              <div className="space-y-6">
                {/* ② Pricing */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-1.5">② Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Regular Price *</label>
                      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Discount Value</label>
                      <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full p-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" placeholder="e.g. 10 or 500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Discount Type</label>
                      <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "Percentage" | "Fixed")} className="w-full p-2 border rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-black">
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Fixed">Fixed Amount (LKR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tax (Optional %)</label>
                      <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} className="w-full p-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" placeholder="e.g. 8" />
                    </div>
                  </div>
                </div>

                {/* ③ Inventory */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-1.5">③ Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Stock Quantity *</label>
                      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Low Stock Alert</label>
                      <input type="number" value={lowStockAlert} onChange={(e) => setLowStockAlert(e.target.value)} className="w-full p-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Stock Status</label>
                      <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className="w-full p-2 border rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-black">
                        <option value="In Stock">In Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Pre-Order">Pre-Order</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Barcode / UPC / EAN</label>
                      <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} className="w-full p-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <input type="checkbox" id="trackInventory" checked={trackInventory} onChange={(e) => setTrackInventory(e.target.checked)} className="w-4 h-4 text-black rounded" />
                      <label htmlFor="trackInventory" className="text-xs font-bold text-gray-600">Track Inventory?</label>
                    </div>
                  </div>
                </div>

                {/* ④ Variants */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="font-bold text-gray-900 text-[10px] uppercase tracking-widest border-b pb-1.5">④ Variants Matrix</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Size</label>
                      <input type="text" placeholder="e.g. S, M, 100ml" value={vSize} onChange={(e) => setVSize(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Color</label>
                      <input type="text" placeholder="e.g. Black, Rose" value={vColor} onChange={(e) => setVColor(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price *</label>
                      <input type="number" placeholder="Variant Price" value={vPrice} onChange={(e) => setVPrice(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Discount Val</label>
                      <input type="number" placeholder="Discount" value={vDiscountValue} onChange={(e) => setVDiscountValue(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Discount Type</label>
                      <select value={vDiscountType} onChange={(e) => setVDiscountType(e.target.value as "Percentage" | "Fixed")} className="w-full p-1.5 border rounded bg-white text-[10px] outline-none focus:ring-1 focus:ring-black">
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Fixed">Fixed (LKR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock</label>
                      <input type="number" placeholder="Stock" value={vStock} onChange={(e) => setVStock(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Variant SKU</label>
                      <input type="text" placeholder="e.g. TS-BLK-S" value={vSku} onChange={(e) => setVSku(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs uppercase outline-none focus:ring-1 focus:ring-black" />
                    </div>
                  </div>
                  <button type="button" onClick={handleAddVariantToList} className="w-full bg-gray-50 border text-gray-900 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition">
                    + Add Variant Matrix Row
                  </button>

                  {variants.length > 0 && (
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2 max-h-40 overflow-y-auto">
                      {variants.map((v, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-gray-600 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <div>
                            <span className="font-semibold block">
                              • {v.size || "N/A"} / {v.color || "N/A"} - LKR {Number(v.price).toLocaleString()} (Stock: {v.stock})
                            </span>
                            {v.sku && <span className="text-[9px] text-gray-400 font-mono">SKU: {v.sku}</span>}
                          </div>
                          <button type="button" onClick={() => handleRemoveVariantFromList(idx)} className="text-red-500 font-bold ml-2 text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Invisible Submit Trigger */}
              <button id="modal-submit-btn" type="submit" className="hidden" />
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => document.getElementById("modal-submit-btn")?.click()}
                disabled={loading}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition"
              >
                {loading ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {fetchLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm font-medium text-gray-400 animate-pulse">Loading products...</p>
        </div>
      ) : (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">Products Inventory ({filteredProducts.length})</h2>
            <p className="text-xs text-gray-400 mt-1">Review catalog items, prices, and stock statuses.</p>
          </div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Name, Category or SKU..." className="px-4 py-2.5 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-gray-900 w-full sm:w-64 bg-white text-gray-900" />
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
                  <th className="p-3.5">Stock & Variants</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border relative bg-gray-50 flex-shrink-0">
                        <Image src={prod.images[0]} alt="" fill unoptimized className="object-cover" />
                      </div>
                    </td>
                    <td className="p-3.5 space-y-1">
                      <p className="font-bold text-gray-900">{prod.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">{prod.category?.name}</span>
                        <span className="inline-block text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">{prod.brand?.name || "No Brand"}</span>
                        {prod.sku && <span className="inline-block text-[9px] bg-gray-900/5 text-gray-600 px-1.5 py-0.5 rounded font-mono font-bold">SKU: {prod.sku}</span>}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">LKR {(prod.discountPrice || prod.price).toLocaleString()}</td>
                    <td className="p-3.5 text-[11px] text-gray-500 space-y-1.5">
                      {prod.variants && prod.variants.length > 0 ? (
                        prod.variants.map((v, i) => (
                          <div key={i} className="font-semibold text-gray-600 border-b last:border-0 pb-1.5 last:pb-0">
                            <p>• {v.size || "N/A"} / {v.color || "N/A"}: <span className={v.stock <= 0 ? "text-red-500 font-bold" : "text-green-600"}>{v.stock} left</span></p>
                            {v.sku && <p className="text-[9px] text-gray-400 font-mono">SKU: {v.sku}</p>}
                          </div>
                        ))
                      ) : (
                        <p className="font-semibold text-gray-600">Base Stock: <span className={prod.stock <= 0 ? "text-red-500 font-bold" : "text-green-600"}>{prod.stock} left</span></p>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button onClick={() => handleEditClick(prod)} className="bg-gray-50 hover:bg-gray-900 hover:text-white border px-2.5 py-1.5 rounded-lg text-xs font-bold transition">Edit</button>
                        <button onClick={() => handleDeleteClick(prod._id)} className="bg-red-50 hover:bg-red-500 hover:text-white border text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold transition">Delete</button>
                      </div>
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