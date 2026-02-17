// models/PatientDocument.js
import mongoose from "mongoose";

const patientDocumentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },

    category: { type: String, enum: ["Lab Report", "Prescription", "Scan", "Other"], default: "Other" },

    fileName: { type: String, required: true },
    mimeType: { type: String },
    sizeBytes: { type: Number },

    cloudinaryPublicId: { type: String, required: true },
    fileUrl: { type: String, required: true },

    isDeleted: { type: Boolean, default: false }, // soft delete
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("PatientDocument", patientDocumentSchema);
