// src/models/Coupon.ts
import mongoose, { Schema, models } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["Percentage", "Fixed"], required: true }, // Percentage (%) හෝ Fixed (LKR)
    discountValue: { type: Number, required: true }, // වට්ටම් ප්‍රමාණය (උදා: 10% හෝ LKR 500)
    minOrderAmount: { type: Number, default: 0 }, // කූපන් එක පාවිච්චි කරන්න තිබිය යුතු අවම බිල් පතේ අගය
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;