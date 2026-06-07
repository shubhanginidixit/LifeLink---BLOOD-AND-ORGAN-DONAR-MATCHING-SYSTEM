const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.route("/").get(protect, getNotifications);
router.route("/:id/read").patch(protect, markAsRead);

module.exports = router;
