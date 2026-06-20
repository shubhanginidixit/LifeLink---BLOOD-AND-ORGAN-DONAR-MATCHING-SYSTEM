const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getChatHistory,
  getChatList,
  markMessagesRead,
  sendMessage,
  sendTyping,
  sendStopTyping,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/", protect, getChatList);
router.get("/:userId", protect, getChatHistory);
router.post("/:userId/read", protect, markMessagesRead);
router.post("/:userId/send", protect, sendMessage);
router.post("/:userId/typing", protect, sendTyping);
router.post("/:userId/stop-typing", protect, sendStopTyping);

module.exports = router;
