// src/models/Order.ts
import mongoose, { Schema, models } from "mongoose";

const orderSchema = new Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    items: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
        description: { type: String }, 
      },
    ],
    totalAmount: { type: Number, required: true },
     shippingFee: { type: Number, default: 0 },
    couponCode: { type: String }, 
    discountAmount: { type: Number, default: 0 }, 
    paymentMethod: { type: String, enum: ["COD", "BankTransfer"], required: true },
    bankSlip: { type: String }, // Cloudinary Image URL (Bank Transfer නම් පමණි)
    status: { type: String, enum: ["Pending", "Processing", "Shipped", "Cancelled"], default: "Pending" },
  },
  { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", orderSchema);
export default Order;