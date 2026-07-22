// src/models/Review.ts
import mongoose, { Schema, models } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // ලියන කෙනාගේ නම
    rating: { type: Number, required: true, min: 1, max: 5 }, // තරු ගණන 1 සිට 5 දක්වා
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = models.Review || mongoose.model("Review", reviewSchema);
export default Review;