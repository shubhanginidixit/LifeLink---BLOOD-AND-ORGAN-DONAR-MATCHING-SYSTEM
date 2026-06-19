const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  resetPassword,
  getMe,
  updateProfile,
  deleteAccount,
  blockDonor,
  unblockDonor,
  saveFCMToken,
  googleAuth
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/delete", protect, deleteAccount);
router.post("/block/:donorId", protect, blockDonor);
router.post("/unblock/:donorId", protect, unblockDonor);
router.post("/fcm-token", protect, saveFCMToken);

module.exports = router;
