const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    patientId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },

    dob: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    address: {
      district: { type: String, required: true },
      city: { type: String, required: true },
      line1: { type: String, required: true },
    },
    nic: String,

    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, required: true },
    },

    bloodGroup: { type: String, match: /^(A|B|AB|O)[+-]$/i },
    allergies: [String],
    chronicConditions: [String],
    heightCm: { type: Number, min: 30, max: 250 },
    weightKg: { type: Number, min: 2, max: 300 },

    profileStrength: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
