const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    visitType: {
      type: String,
      enum: ["consultation", "follow-up", "emergency"],
      default: "consultation",
    },

    chiefComplaint: {
      type: String,
      trim: true,
    },

    symptoms: [String],

    diagnosis: {
      type: String,
      trim: true,
    },

    secondaryDiagnosis: [String],

    icdCode: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    treatmentPlan: {
      type: String,
      trim: true,
    },

    followUpDate: Date,

    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      oxygenSat: Number,
    },

    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },

    attachments: [
      {
        type: String,
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patientId: 1, visitDate: -1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);