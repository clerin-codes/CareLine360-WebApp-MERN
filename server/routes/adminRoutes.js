const express = require("express");
const { body } = require("express-validator");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const {
  getPendingDoctors,
  patchUserStatus,
  postCreateUser,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getStats,
  getAppointments,
  createMeetingLink
} = require("../controllers/adminController");

const router = express.Router();

// admin-only
router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/doctors/pending", getPendingDoctors);
router.get("/users", getAllUsers);
router.get("/appointments", getAppointments);
router.post("/appointments/:id/meeting", createMeetingLink);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/stats", getStats);


router.patch(
  "/users/:id/status",
  [body("status").isIn(["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"]).withMessage("Invalid status")],
  patchUserStatus
);

router.post(
  "/users",
  [
    body("password").isLength({ min: 8 }),
    body().custom((value) => {
      if (!value.email && !value.phone) throw new Error("Email or phone is required");
      return true;
    }),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("role").isIn(["patient", "doctor", "responder", "admin"]).withMessage("Invalid role")
  ],
  postCreateUser
);

module.exports = router;
