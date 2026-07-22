// src/models/Setting.ts
import mongoose, { Schema, models } from "mongoose";

const settingSchema = new Schema(
  {
    storeName: { type: String, default: "The Store" },
    logo: { type: String, default: "" }, // <-- dynamic logo එක සඳහා Cloudinary Image URL එක
    contactEmail: { type: String, default: "info@thestore.com" },
    contactPhone: { type: String, default: "0771234567" },
    contactAddress: { type: String, default: "Colombo, Sri Lanka" },
    
    bankName: { type: String, default: "Commercial Bank" },
    bankAccountName: { type: String, default: "The Store Pvt Ltd" },
    bankAccountNumber: { type: String, default: "1234567890" },
    bankBranch: { type: String, default: "Colombo Fort" },

    deliveryCharge: { type: Number, default: 350 },
    freeDeliveryThreshold: { type: Number, default: 5000 },
  },
  { timestamps: true }
);

const Setting = models.Setting || mongoose.model("Setting", settingSchema);
export default Setting;