const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Haversine Distance helper
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @desc    Search donors based on type, query, and coordinates
// @route   GET /api/search
// @access  Private
const searchDonors = asyncHandler(async (req, res) => {
  const { type, query, lat, lng } = req.query;

  if (!type || !["blood", "organ"].includes(type)) {
    res.status(400);
    throw new Error("Valid search type (blood or organ) is required");
  }

  const currentUser = await User.findById(req.user._id);
  const blockedIds = currentUser ? currentUser.blockedIds : [];

  // Base query: profile must be complete, eligibility verified
  const dbQuery = {
    profileComplete: true,
    "profile.eligibilityStatus": "verified",
    _id: { $ne: req.user._id, $nin: blockedIds } // Don't search self or blocked donors
  };

  if (type === "blood") {
    dbQuery["profile.donateBlood"] = true;
    if (query) {
      dbQuery["profile.bloodGroup"] = { $regex: new RegExp(`^${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") };
    }
  } else if (type === "organ") {
    dbQuery["profile.donateOrgan"] = true;
    if (query) {
      dbQuery["profile.organs"] = { $regex: new RegExp(query.trim(), "i") };
    }
  }

  const matchingUsers = await User.find(dbQuery).select("-password");

  // Map and calculate distance
  let donors = matchingUsers.map(u => {
    const donorObj = {
      id: u._id.toString(),
      _id: u._id.toString(),
      bloodGroup: u.profile.bloodGroup,
      age: u.profile.age,
      gender: u.profile.gender,
      weight: u.profile.weight,
      smoker: u.profile.smoker,
      alcoholic: u.profile.alcoholic,
      illnesses: u.profile.illnesses,
      donateBlood: u.profile.donateBlood,
      donateOrgan: u.profile.donateOrgan,
      organs: u.profile.organs,
      lat: u.profile.lat,
      lng: u.profile.lng,
      city: u.profile.city,
      available: true, // If verified and enabled, they are available
    };

    if (lat && lng) {
      donorObj.distance = haversineDistance(
        u.profile.lat,
        u.profile.lng,
        Number(lat),
        Number(lng)
      );
    }
    return donorObj;
  });

  // Sort by distance if coordinates provided
  if (lat && lng) {
    donors.sort((a, b) => a.distance - b.distance);
  }

  res.json(donors);
});

// @desc    Get donor profile by ID
// @route   GET /api/search/:id
// @access  Private
const getDonorById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.profileComplete) {
    res.status(404);
    throw new Error("Donor not found");
  }

  const donorObj = {
    id: user._id.toString(),
    _id: user._id.toString(),
    bloodGroup: user.profile.bloodGroup,
    age: user.profile.age,
    gender: user.profile.gender,
    weight: user.profile.weight,
    smoker: user.profile.smoker,
    alcoholic: user.profile.alcoholic,
    illnesses: user.profile.illnesses,
    donateBlood: user.profile.donateBlood,
    donateOrgan: user.profile.donateOrgan,
    organs: user.profile.organs,
    lat: user.profile.lat,
    lng: user.profile.lng,
    city: user.profile.city,
    available: true,
  };

  res.json(donorObj);
});

module.exports = { searchDonors, getDonorById };
