import mongoose, { Schema, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true }, // Cloudinary Image URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = models.Category || mongoose.model("Category", categorySchema);
export default Category;