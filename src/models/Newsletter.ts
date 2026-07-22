// src/models/Newsletter.ts
import mongoose, { Schema, models } from "mongoose";

const newsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

const Newsletter = models.Newsletter || mongoose.model("Newsletter", newsletterSchema);
export default Newsletter;