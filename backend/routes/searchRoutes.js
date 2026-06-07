const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { searchNearbyDonors } = require("../controllers/searchController");

const router = express.Router();

router.get("/nearby", protect, searchNearbyDonors);

module.exports = router;
