import mongoose, { Schema, models } from "mongoose";

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;