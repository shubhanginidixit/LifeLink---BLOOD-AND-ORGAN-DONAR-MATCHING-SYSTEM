const asyncHandler = require("express-async-handler");
const Donor = require("../models/Donor");

// @desc    Find nearby available donors
// @route   GET /api/search/nearby
// @access  Private
const searchNearbyDonors = asyncHandler(async (req, res) => {
  const { lat, lng, radius, bloodGroup, organType } = req.query;

  if (!lat || !lng) {
    res.status(400);
    throw new Error("Latitude and longitude are required for nearby search");
  }

  // Radius in radians (Earth radius is approx 3963.2 miles)
  const searchRadius = radius ? radius / 3963.2 : 25 / 3963.2; // default 25 miles

  const query = {
    location: {
      $geoWithin: {
        $centerSphere: [[Number(lng), Number(lat)], searchRadius]
      }
    },
    available: true
  };

  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (organType) query.organType = organType;

  const donors = await Donor.find(query).populate("user", "fullName email");

  res.json({
    count: donors.length,
    donors
  });
});

module.exports = { searchNearbyDonors };
