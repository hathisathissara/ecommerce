// src/models/Coupon.ts
import mongoose, { Schema, models } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["Percentage", "Fixed"], required: true }, // Percentage (%) or Fixed (LKR)
    discountValue: { type: Number, required: true }, // Discount amount (eg 10% or LKR 500)
    minOrderAmount: { type: Number, default: 0 }, // Minimum bill value to use the coupon
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;