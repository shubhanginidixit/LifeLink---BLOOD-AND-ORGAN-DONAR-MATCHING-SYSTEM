const express = require("express");
const { protect, role } = require("../middleware/authMiddleware");
const {
  createRequest,
  getRequests,
  updateRequest
} = require("../controllers/requestController");

const router = express.Router();

router.route("/")
  .post(protect, role("hospital"), createRequest)
  .get(protect, getRequests);

router.route("/:id")
  .patch(protect, role("hospital"), updateRequest);

module.exports = router;
