// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["patient", "doctor", "responder", "admin"], required: true },

    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    phone: { type: String, trim: true, unique: true, sparse: true },

    passwordHash: { type: String, required: true },

    isVerified: { type: Boolean, default: false }, // verification (locks fields after true)
    isActive: { type: Boolean, default: true },    // soft delete

    lastLoginAt: { type: Date },

    // refresh token security (store hashed)
    refreshTokenHash: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
