const express = require("express");
const { protect, role } = require("../middleware/authMiddleware");
const {
  registerHospital,
  getHospitals,
  getMyHospital
} = require("../controllers/hospitalController");

const router = express.Router();

router.route("/")
  .post(protect, role("hospital"), registerHospital)
  .get(protect, getHospitals);

router.route("/me")
  .get(protect, role("hospital"), getMyHospital);

module.exports = router;
