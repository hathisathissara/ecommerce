// src/models/Counter.ts
import mongoose, { Schema, models } from "mongoose";

const counterSchema = new Schema(
  {
    _id: { type: String, required: true }, // e.g., "orders", "invoices"
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Counter = models.Counter || mongoose.model("Counter", counterSchema);
export default Counter;
