// src/models/Product.ts
import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
  {
    // ① BASIC INFO
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, uppercase: true, trim: true }, // Base SKU
    shortDescription: { type: String }, // කෙටි විස්තරය
    description: { type: String, required: true }, // Full Description
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: String }, // උප කාණ්ඩය
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    tags: [{ type: String }], // Tags Array එක

    // ② PRICING (Base Product)
    price: { type: Number, required: true }, // Regular Price
    discountValue: { type: Number, default: 0 }, // වට්ටම් අගය
    discountType: { type: String, enum: ["Percentage", "Fixed"], default: "Percentage" }, // % හෝ LKR
    discountPrice: { type: Number, default: null }, // Auto-calculated final discount price
    tax: { type: Number, default: 0 }, // බදු (Optional)

    // ③ INVENTORY (Base Product)
    stock: { type: Number, required: true }, // Stock Quantity
    lowStockAlert: { type: Number, default: 5 }, // අඩු තොග අනතුරු ඇඟවීම
    stockStatus: { type: String, enum: ["In Stock", "Out of Stock", "Pre-Order"], default: "In Stock" },
    barcode: { type: String }, // Barcode / UPC / EAN
    trackInventory: { type: Boolean, default: true }, // Track Inventory?

    // ④ VARIANTS (Double-Attribute Matrix: Size + Color)
    variants: [
      {
        size: { type: String }, // e.g. "S", "M", "L"
        color: { type: String }, // e.g. "Black", "White"
        price: { type: Number, required: true }, // Variant Regular Price
        discountValue: { type: Number, default: 0 },
        discountType: { type: String, enum: ["Percentage", "Fixed"], default: "Percentage" },
        discountPrice: { type: Number, default: null }, // Variant Auto-calculated discount price
        stock: { type: Number, default: 0 }, // Variant Stock
        sku: { type: String, uppercase: true, trim: true }, // Variant SKU
      }
    ],

    // ⑤ IMAGES
    images: [{ type: String, required: true }], // First image is Main, others are Gallery
    isGiftItem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;