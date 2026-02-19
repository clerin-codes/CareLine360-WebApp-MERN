const express = require("express");
const { body } = require("express-validator");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const { getPendingDoctors, patchUserStatus, postCreateResponder } = require("../controllers/adminController");

const router = express.Router();

// admin-only
router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/doctors/pending", getPendingDoctors);

router.patch(
  "/users/:id/status",
  [body("status").isIn(["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"]).withMessage("Invalid status")],
  patchUserStatus
);

router.post(
  "/responders",
  [
    body("password").isLength({ min: 8 }),
    body().custom((value) => {
      if (!value.email && !value.phone) throw new Error("Email or phone is required");
      return true;
    }),
  ],
  postCreateResponder
);

module.exports = router;
