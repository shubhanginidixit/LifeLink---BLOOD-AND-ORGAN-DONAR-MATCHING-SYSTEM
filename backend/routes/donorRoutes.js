const express = require("express");
const { protect, role } = require("../middleware/authMiddleware");
const {
  registerDonor,
  getDonors,
  getDonorsByBloodGroup,
  getMyProfile,
  updateDonor
} = require("../controllers/donorController");

const router = express.Router();

router.route("/")
  .post(protect, role("donor"), registerDonor)
  .get(protect, getDonors);

router.route("/me")
  .get(protect, role("donor"), getMyProfile)
  .put(protect, role("donor"), updateDonor);

router.get("/blood/:group", protect, getDonorsByBloodGroup);

module.exports = router;
