// src/models/Banner.ts
import mongoose, { Schema, models } from "mongoose";

const bannerSchema = new Schema(
  {
    title: { type: String },
    subtitle: { type: String },
    image: { type: String, required: true }, // Cloudinary Image URL
    link: { type: String }, // ක්ලික් කළ විට යා යුතු ලින්ක් එක (උදා: /products?category=perfumes)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = models.Banner || mongoose.model("Banner", bannerSchema);
export default Banner;