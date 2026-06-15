/**
 * @file notificationRoutes.js
 * @description Router mapping for notification delivery and readout endpoints.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications
} = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getNotifications)
  .delete(clearNotifications);

router.patch("/:id/read", markAsRead);
router.post("/read-all", markAllAsRead);

module.exports = router;
