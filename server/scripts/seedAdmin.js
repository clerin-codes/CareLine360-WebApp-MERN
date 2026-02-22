require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set.");
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("✅ Admin already exists:", email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      role: "admin",
      status: "ACTIVE",
      email,
      passwordHash,
      isVerified: true,
    });

    console.log("✅ Admin created:", email);
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed error:", e);
    process.exit(1);
  }
})();
