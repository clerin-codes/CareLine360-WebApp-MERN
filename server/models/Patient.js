// models/Patient.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    patientId: { type: String, required: true, unique: true }, // PAT-000001

    // Basic Info (30%)
    fullName: { type: String, required: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: {
      district: String,
      city: String,
      line1: String,
    },
    nic: { type: String, trim: true }, // optional based on your policy

    // Emergency (30%)
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    // Medical Info (20%)
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
    heightCm: Number,
    weightKg: Number,

    profileStrength: { type: Number, default: 0 }, // calculated
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
