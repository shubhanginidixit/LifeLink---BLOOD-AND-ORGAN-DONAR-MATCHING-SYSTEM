const express = require("express");
const {
  getStats,
  getBloodDistribution,
  getMonthlyTrends,
  getOrganSummary
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", getStats);
router.get("/blood-distribution", getBloodDistribution);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/organ-summary", getOrganSummary);

module.exports = router;
