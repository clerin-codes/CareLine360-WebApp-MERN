const express = require("express");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const { getMyProfile , updateMyProfile } = require("../controllers/patientController");

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  roleMiddleware(["patient"]),
  getMyProfile,
  updateMyProfile
);

router.patch(
  "/me", 
  authMiddleware, 
  roleMiddleware(["patient"]), 
  updateMyProfile
);

module.exports = router;
