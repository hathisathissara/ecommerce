// src/models/Product.ts
import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, uppercase: true, trim: true }, // <-- Base Product SKU (e.g. PERF-CHAN-50)
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, default: 10 },
    images: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    inStock: { type: Boolean, default: true },
    isGiftItem: { type: Boolean, default: false },

    // හැම Variant (ප්‍රභේදය) සඳහාම වෙන වෙනම SKU කේතයන් ඇත
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        stock: { type: Number, default: 5 },
        sku: { type: String, uppercase: true, trim: true }, // <-- Variant SKU (e.g. PERF-CHAN-100)
      }
    ]
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;