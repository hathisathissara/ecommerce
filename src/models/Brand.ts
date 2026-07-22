// src/models/Brand.ts
import mongoose, { Schema, models } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true }, // Cloudinary Brand Logo URL
  },
  { timestamps: true }
);

const Brand = models.Brand || mongoose.model("Brand", brandSchema);
export default Brand;