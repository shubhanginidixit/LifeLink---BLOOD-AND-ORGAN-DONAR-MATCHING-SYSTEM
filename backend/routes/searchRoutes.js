const express = require("express");
const { optionalProtect, protect } = require("../middleware/authMiddleware");
const { searchDonors, getDonorById } = require("../controllers/searchController");

const router = express.Router();

router.get("/", optionalProtect, searchDonors);
router.get("/:id", protect, getDonorById);

module.exports = router;
