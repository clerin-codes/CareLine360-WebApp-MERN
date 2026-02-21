const express = require("express");
const router = express.Router();
const validateRequest = require("../middleware/validateRequest");
const { sendMessageRules, getMessagesRules, markReadRules } = require("../validators/chatValidator");
const { sendMessage, getMessages, markAsRead } = require("../controllers/chatController");

router.post("/", sendMessageRules, validateRequest, sendMessage);
router.get("/:appointmentId", getMessagesRules, validateRequest, getMessages);
router.patch("/:appointmentId/read", markReadRules, validateRequest, markAsRead);

module.exports = router;
