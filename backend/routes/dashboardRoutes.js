const express = require("express");

const Donor = require("../models/Donor");
const Hospital = require("../models/Hospital");
const Request = require("../models/Request");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalDonors =
      await Donor.countDocuments();

    const registeredHospitals =
      await Hospital.countDocuments();

    const activeRequests =
      await Request.countDocuments({
        status: "Pending",
      });

    const successfulMatches =
      await Request.countDocuments({
        status: "Fulfilled",
      });

    res.json({
      totalDonors,
      activeRequests,
      successfulMatches,
      registeredHospitals,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
