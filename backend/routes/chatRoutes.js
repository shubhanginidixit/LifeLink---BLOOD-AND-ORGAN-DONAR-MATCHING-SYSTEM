const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getChatHistory,
  getChatList,
  markMessagesRead,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/", protect, getChatList);
router.get("/:userId", protect, getChatHistory);
router.post("/:userId/read", protect, markMessagesRead);

module.exports = router;
