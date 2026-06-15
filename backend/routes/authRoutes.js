/**
 * @file authRoutes.js
 * @description Router mapping for user authentication and authorization endpoints.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

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
  unblockDonor
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/delete", protect, deleteAccount);
router.post("/block/:donorId", protect, blockDonor);
router.post("/unblock/:donorId", protect, unblockDonor);

module.exports = router;
