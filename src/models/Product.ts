// src/models/Product.ts
import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
  {
    // ① BASIC INFO
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, uppercase: true, trim: true },
    shortDescription: { type: String },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    tags: [{ type: String }],

    // ② PRICING
    price: { type: Number, required: true },
    discountValue: { type: Number, default: 0 },
    discountType: { type: String, enum: ["Percentage", "Fixed"], default: "Percentage" },
    discountPrice: { type: Number, default: null },
    tax: { type: Number, default: 0 },

    // ③ INVENTORY & SALES COUNT
    stock: { type: Number, required: true },
    lowStockAlert: { type: Number, default: 5 },
    stockStatus: { type: String, enum: ["In Stock", "Out of Stock", "Pre-Order"], default: "In Stock" },
    barcode: { type: String },
    trackInventory: { type: Boolean, default: true },
    salesCount: { type: Number, default: 0 }, // ⚡ The latest field where the number of sales is recorded ⚡

    // ④ VARIANTS (Size + Color)
    variants: [
      {
        size: { type: String },
        color: { type: String },
        price: { type: Number, required: true },
        discountValue: { type: Number, default: 0 },
        discountType: { type: String, enum: ["Percentage", "Fixed"], default: "Percentage" },
        discountPrice: { type: Number, default: null },
        stock: { type: Number, default: 0 },
        sku: { type: String, uppercase: true, trim: true },
      }
    ],

    // ⑤ IMAGES
    images: [{ type: String, required: true }],
    isGiftItem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;