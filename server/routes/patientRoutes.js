const express = require("express");
const rateLimit = require("express-rate-limit");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const { getMyProfile , updateMyProfile , uploadAvatar} = require("../controllers/patientController");
const { imageUpload } = require("../middleware/upload");

const router = express.Router();

const patientLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, try again later" },
});

router.get(
  "/me",
  patientLimiter,
  authMiddleware,
  roleMiddleware(["patient"]),
  getMyProfile,
);

router.patch(
  "/me", 
  patientLimiter,
  authMiddleware, 
  roleMiddleware(["patient"]), 
  updateMyProfile
);

router.patch(
  "/me/avatar",
  patientLimiter,
  authMiddleware,
  roleMiddleware(["patient"]),
  imageUpload.single("avatar"),
  uploadAvatar
);

module.exports = router;
