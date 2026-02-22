require("dotenv").config();

const express = require("express");
// const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const patientRoutes = require("./routes/patientRoutes");
const documentRoutes = require("./routes/documentRoutes");

// Load environment variables
// dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/documents", documentRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Example Route Import
// const userRoutes = require("./routes/userRoutes");
// app.use("/api/users", userRoutes);

// ✅ Multer / Cloudinary specific errors
app.use((err, req, res, next) => {
  if (err?.message?.includes("Only image files allowed")) {
    return res.status(400).json({ message: "Only image files allowed" });
  }

  if (err?.message?.includes("Only PDF, images, DOC, DOCX allowed")) {
    return res
      .status(400)
      .json({ message: "Only PDF, images, DOC, DOCX allowed" });
  }

  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Please check the size limit for this upload type." });
  }

  console.error("Upload error:", err?.code || err?.message);
  return res.status(500).json({ message: "Server error" });
});

// Global error fallback
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ message: "Server error" });
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
