const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Diagnosis
    chiefComplaint: { type: String, trim: true, default: "" },
    diagnosis: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },

    // Vitals
    vitals: {
      bloodPressure: { type: String, default: "" }, // "120/80"
      heartRate: { type: Number, default: null },
      temperature: { type: Number, default: null }, // Celsius
      oxygenSaturation: { type: Number, default: null }, // %
      weight: { type: Number, default: null },
      height: { type: Number, default: null },
    },

    // Prescriptions embedded in record
    prescriptions: [
      {
        medicine: { type: String, trim: true },
        dosage: { type: String, trim: true },
        frequency: { type: String, trim: true },
        duration: { type: String, trim: true },
        instructions: { type: String, trim: true },
      },
    ],

    // Uploaded PDFs/scans (Cloudinary)
    attachments: [
      {
        fileUrl: String,
        publicId: String,
        fileName: String,
        mimeType: String,
      },
    ],

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);