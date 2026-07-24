// src/models/Box.ts
import mongoose, { Schema, models } from "mongoose";

const boxSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // Cloudinary Image URL
  },
  { timestamps: true }
);

const Box = models.Box || mongoose.model("Box", boxSchema);
export default Box;