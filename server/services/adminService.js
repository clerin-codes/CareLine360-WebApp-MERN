const bcrypt = require("bcryptjs");
const User = require("../models/User");

const listPendingDoctors = async () => {
  const doctors = await User.find({ role: "doctor", status: "PENDING", isActive: true }).select(
    "-passwordHash -refreshTokenHash"
  );
  return { status: 200, data: doctors };
};

const updateUserStatus = async ({ userId, status }) => {
  const allowed = ["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"];
  if (!allowed.includes(status)) return { status: 400, data: { message: "Invalid status" } };

  const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select(
    "-passwordHash -refreshTokenHash"
  );
  if (!user) return { status: 404, data: { message: "User not found" } };

  return { status: 200, data: { message: "Status updated", user } };
};

const createResponder = async ({ email, phone, password }) => {
  if (!email && !phone) return { status: 400, data: { message: "Email or phone required" } };

  const existing = await User.findOne(email ? { email: email.toLowerCase() } : { phone });
  if (existing) return { status: 409, data: { message: "User already exists" } };

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    role: "responder",
    status: "ACTIVE",
    email: email ? email.toLowerCase() : undefined,
    phone: phone || undefined,
    passwordHash,
  });

  return {
    status: 201,
    data: {
      message: "Responder created",
      user: { id: user._id, role: user.role, email: user.email, phone: user.phone, status: user.status },
    },
  };
};

module.exports = { listPendingDoctors, updateUserStatus, createResponder };
