/**
 * @file callLogRoutes.js
 * @description Router mapping for emergency call logs and history endpoints.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getCallLogs,
  addCallLog,
  deleteCallLog
} = require("../controllers/callLogController");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getCallLogs)
  .post(addCallLog);

router.route("/:id")
  .delete(deleteCallLog);

module.exports = router;
