const express = require("express");
const { protect, role } = require("../middleware/authMiddleware");
const {
  createRequest,
  createDonorRequest,
  getMyRequests,
  getRequests,
  updateRequest
} = require("../controllers/requestController");

const router = express.Router();

router.route("/")
  .post(protect, role("hospital"), createRequest)
  .get(protect, getRequests);

router.get("/mine", protect, getMyRequests);
router.post("/donor", protect, createDonorRequest);

router.route("/:id")
  .patch(protect, role("hospital"), updateRequest);

module.exports = router;
