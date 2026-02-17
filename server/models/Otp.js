// models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    target: { type: String, required: true }, // email or phone
    purpose: { type: String, enum: ["VERIFY", "RESET_PASSWORD"], required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto cleanup

export default mongoose.model("Otp", otpSchema);
