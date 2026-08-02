// src/models/Review.ts
import mongoose, { Schema, models } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // Name of the writer
    rating: { type: Number, required: true, min: 1, max: 5 }, // Number of stars from 1 to 5
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = models.Review || mongoose.model("Review", reviewSchema);
export default Review;