// src/app/(store)/gift-builder/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const CARD_THEMES = ["None", "Birthday", "Anniversary", "Thank You", "Love", "General"];

interface BoxType {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface VariantType {
  size: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku?: string;
}

interface ProductType {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  isGiftItem: boolean;
  variants?: VariantType[]; // <-- Variants array එක එකතු කළා
}

// තෑගි පෙට්ටියට දමන අයිතම ව්‍යුහය (ප්‍රභේදය සමඟින්)
interface SelectedItemType {
  _id: string; // Dynamic Unique ID (product-id-size)
  product: ProductType;
  selectedVariant: VariantType | null; // තෝරාගත් ප්‍රභේදය
  quantity: number;
}

export default function GiftBuilder() {
  const [step, setStep] = useState(1);
  const [boxes, setBoxes] = useState<BoxType[]>([]);
  const [giftProducts, setGiftProducts] = useState<ProductType[]>([]);
  const { addToCart } = useCart();
  const router = useRouter();

  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItemType[]>([]);
  const [cardTheme, setCardTheme] = useState("None");
  const [cardMessage, setCardMessage] = useState("");

  // Card එක මත තෝරාගෙන ඇති ප්‍රභේදය තාවකාලිකව තබාගන්නා State එක (Product ID -> Selected Variant)
  const [activeVariants, setActiveVariants] = useState<Record<string, VariantType>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boxRes, prodRes] = await Promise.all([
          fetch("/api/boxes", { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" })
        ]);

        if (boxRes.ok) {
          const boxesData = await boxRes.json();
          setBoxes(boxesData);
          if (boxesData.length > 0) setSelectedBox(boxesData[0]);
        }

        if (prodRes.ok) {
          const productsData = await prodRes.json();
          // Gift Item එකක් ලෙස සකසා ඇති භාණ්ඩ පමණක් පෙරා ගනී
          const filtered = productsData.filter((p: ProductType) => p.isGiftItem === true);
          setGiftProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to load builder data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Card එකක් මත ඇති ප්‍රභේදයක් වෙනස් කිරීමේ Function එක
  const handleSelectVariant = (productId: string, variant: VariantType) => {
    setActiveVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  // Item එකක් (ප්‍රභේදය සමඟින්) Box එකට එකතු කිරීම
  const handleToggleItem = (product: ProductType, variant: VariantType | null) => {
    const uniqueId = variant ? `${product._id}-${variant.size}` : product._id;

    setSelectedItems((prev) => {
      const exists = prev.find((i) => i._id === uniqueId);
      if (exists) {
        return prev.filter((i) => i._id !== uniqueId);
      }
      return [...prev, { _id: uniqueId, product, selectedVariant: variant, quantity: 1 }];
    });
  };

  // Quantity එක වෙනස් කිරීම (Unique ID එකට අදාළව)
  const handleQuantityChange = (uniqueId: string, newQty: number) => {
    if (newQty <= 0) {
      setSelectedItems((prev) => prev.filter((i) => i._id !== uniqueId));
      return;
    }
    setSelectedItems((prev) =>
      prev.map((i) => (i._id === uniqueId ? { ...i, quantity: newQty } : i))
    );
  };

  // මිල ගණන් එකතුව ගණනය කිරීම (ප්‍රභේදය අනුව dynamic ලෙස)
  const itemsTotal = selectedItems.reduce((acc, item) => {
    const price = item.selectedVariant
      ? (item.selectedVariant.discountPrice || item.selectedVariant.price)
      : (item.product.discountPrice || item.product.price);
    return acc + price * item.quantity;
  }, 0);

  const builderTotal = (selectedBox?.price || 0) + itemsTotal;

  const handleAddBoxToCart = () => {
    if (!selectedBox) return;

    const uniqueId = `gift-box-${Date.now()}`;
    
    // බඩු විස්තරය ලස්සනට සෑදීම (e.g. Dior (100ml) (x2))
    const itemDetails = selectedItems
      .map((i) => {
        const name = i.selectedVariant ? `${i.product.name} (${i.selectedVariant.size})` : i.product.name;
        return `${name} (x${i.quantity})`;
      })
      .join(", ");

    const virtualGiftBox = {
      _id: uniqueId,
      name: `Custom Gift Box (${selectedBox.name})`,
      price: builderTotal,
      image: selectedBox.image,
      description: `Box: ${selectedBox.name} | Items: [${itemDetails}] | Card: ${cardTheme} | Message: "${cardMessage}"`,
    };

    addToCart(virtualGiftBox);
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-medium text-gray-400 animate-pulse">Loading Builder Setup...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Gift Box Builder</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Custom Gift Box Builder
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Step Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-12 text-xs sm:text-sm">
          <button
            onClick={() => setStep(1)}
            className={`px-4.5 py-2.5 rounded-full font-bold transition ${
              step === 1 ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            1. Box Style
          </button>
          <span className="text-gray-300 hidden sm:inline">➔</span>
          <button
            onClick={() => selectedBox && setStep(2)}
            disabled={!selectedBox}
            className={`px-4.5 py-2.5 rounded-full font-bold transition disabled:opacity-50 ${
              step === 2 ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            2. Choose Items
          </button>
          <span className="text-gray-300 hidden sm:inline">➔</span>
          <button
            onClick={() => selectedItems.length > 0 && setStep(3)}
            disabled={selectedItems.length === 0}
            className={`px-4.5 py-2.5 rounded-full font-bold transition disabled:opacity-50 ${
              step === 3 ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            3. Greeting Note
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Workspace */}
          <div className="lg:col-span-8 bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-sm min-h-[400px]">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Select Box Packaging</h2>
                  <p className="text-xs text-gray-400 mt-1">Pick a luxury box style for your custom gift set.</p>
                </div>

                {boxes.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No Box Styles configured. Please configure them in the Admin Panel.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {boxes.map((box) => (
                      <div
                        key={box._id}
                        onClick={() => setSelectedBox(box)}
                        className={`border-2 rounded-2xl p-4 cursor-pointer text-center transition-all duration-200 ${
                          selectedBox?._id === box._id
                            ? "border-gray-900 bg-gray-50/50"
                            : "border-gray-100 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="aspect-[4/3] w-full relative overflow-hidden rounded-xl bg-gray-50 mb-3">
                          <Image
                            src={box.image}
                            alt={box.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-bold text-sm text-gray-900">{box.name}</h3>
                        <p className="text-xs text-gray-500 font-semibold mt-1">LKR {box.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedBox && (
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-700 transition"
                    >
                      Next: Choose Items →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Choose Gift Items</h2>
                  <p className="text-xs text-gray-400 mt-1">Select from our gift-eligible items and adjust quantities.</p>
                </div>

                {giftProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No gift-eligible products found.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {giftProducts.map((prod) => {
                      const hasVariants = prod.variants && prod.variants.length > 0;
                      // දැනට තෝරාගෙන ඇති Variant එක (නැත්නම් පළමු එක) ලබාගනී
                      const currentVariant = activeVariants[prod._id] || (hasVariants ? prod.variants![0] : null);
                      
                      // Unique ID එක සාදාගනී
                      const uniqueId = currentVariant ? `${prod._id}-${currentVariant.size}` : prod._id;
                      const selectedItem = selectedItems.find((i) => i._id === uniqueId);

                      const displayPrice = currentVariant
                        ? (currentVariant.discountPrice || currentVariant.price)
                        : (prod.discountPrice || prod.price);

                      return (
                        <div
                          key={prod._id}
                          className={`border rounded-2xl p-3 transition flex flex-col justify-between bg-white ${
                            selectedItem ? "border-gray-900 shadow-sm" : "border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div className="aspect-[4/3] w-full relative overflow-hidden rounded-xl bg-gray-50 mb-2.5">
                            <Image
                              src={prod.images[0]}
                              alt={prod.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-grow mb-3 space-y-2">
                            <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{prod.name}</h4>
                            
                            {/* Product Variants (ප්‍රභේද බටන්ස්) */}
                            {hasVariants && (
                              <div className="flex flex-wrap gap-1">
                                {prod.variants!.map((v, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectVariant(prod._id, v)}
                                    className={`px-1.5 py-0.5 border rounded text-[9px] font-bold transition ${
                                      currentVariant?.size === v.size
                                        ? "border-black bg-black text-white"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                  >
                                    {v.size}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* dynamic මිල දර්ශනය */}
                            <p className="text-xs text-gray-500 font-semibold">
                              LKR {displayPrice.toLocaleString()}
                            </p>
                          </div>

                          {selectedItem ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between border border-gray-200 rounded-lg overflow-hidden bg-white">
                                <button
                                  onClick={() => handleQuantityChange(uniqueId, selectedItem.quantity - 1)}
                                  className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                                >
                                  −
                                </button>
                                <span className="text-xs font-black text-gray-900">{selectedItem.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(uniqueId, selectedItem.quantity + 1)}
                                  className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => handleQuantityChange(uniqueId, 0)}
                                className="w-full text-[10px] font-bold bg-red-50 text-red-600 py-1.5 rounded-lg hover:bg-red-100 transition"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleItem(prod, currentVariant)}
                              className="w-full py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold hover:bg-gray-700 transition"
                            >
                              Add to Box
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-100 gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => selectedItems.length > 0 && setStep(3)}
                    disabled={selectedItems.length === 0}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    Next: Add Greeting Card →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Add Greeting Card</h2>
                  <p className="text-xs text-gray-400 mt-1">Select a theme and append a custom greeting message.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Card Theme
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CARD_THEMES.map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setCardTheme(theme)}
                          className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-200 ${
                            cardTheme === theme
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 hover:border-gray-400 bg-white text-gray-700"
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  {cardTheme !== "None" && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Custom Message
                      </label>
                      <textarea
                        value={cardMessage}
                        onChange={(e) => setCardMessage(e.target.value)}
                        placeholder="Write your beautiful message here..."
                        rows={4}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-xs text-gray-900"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100 gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAddBoxToCart}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-700 transition"
                  >
                    Add Completed Box to Cart 🛒
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 bg-gray-50 border border-gray-100 p-6 sm:p-8 rounded-2xl space-y-6">
            <h2 className="text-lg font-black text-gray-900">Your Gift Box Summary</h2>

            <div className="space-y-4 text-xs sm:text-sm text-gray-600">
              {/* Selected Box */}
              {selectedBox && (
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <div>
                    <span className="block font-bold text-gray-900">Box Style</span>
                    <span className="text-[11px] text-gray-400 font-semibold">{selectedBox.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">LKR {selectedBox.price.toLocaleString()}</span>
                </div>
              )}

              {/* Selected Items */}
              <div>
                <span className="block font-bold text-gray-900 mb-2">Items Included</span>
                {selectedItems.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No items added yet</p>
                ) : (
                  <ul className="space-y-2 border-b border-gray-200 pb-3">
                    {selectedItems.map((item) => {
                      const displayName = item.selectedVariant 
                        ? `${item.product.name} (${item.selectedVariant.size})`
                        : item.product.name;
                      const displayPrice = item.selectedVariant
                        ? (item.selectedVariant.discountPrice || item.selectedVariant.price)
                        : (item.product.discountPrice || item.product.price);

                      return (
                        <li key={item._id} className="flex justify-between text-xs text-gray-600 gap-4">
                          <span className="line-clamp-1">
                            • {displayName} <span className="font-bold text-gray-400">×{item.quantity}</span>
                          </span>
                          <span className="font-bold text-gray-900 flex-shrink-0">
                            LKR {(displayPrice * item.quantity).toLocaleString()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Note details */}
              {cardTheme !== "None" && (
                <div className="space-y-1 bg-white border border-gray-100 p-3.5 rounded-xl">
                  <span className="block font-bold text-gray-900 text-xs">Note Card ({cardTheme})</span>
                  {cardMessage && (
                    <p className="text-[11px] text-gray-400 italic leading-snug line-clamp-3">
                      &quot;{cardMessage}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-base sm:text-lg font-black text-gray-900 border-t border-gray-200 pt-4">
              <span>Total Cost</span>
              <span>LKR {builderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}