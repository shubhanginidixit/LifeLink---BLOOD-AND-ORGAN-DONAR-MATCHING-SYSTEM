const asyncHandler = require("express-async-handler");
const User = require("../models/User");

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

  const donors = await Donor.find(query).populate("user", "email");

  res.json({
    count: donors.length,
    donors
  });
});

// @desc    Lifelink generic search donors
// @route   GET /api/search/donors
// @access  Private
const searchDonors = asyncHandler(async (req, res) => {
  const { type, query, lat, lng } = req.query;

  // Find all completed profiles
  const users = await User.find({ profileComplete: true }).select("-password");
  
  let results = users.map(u => ({
    id: u._id,
    email: u.email,
    phone: u.phone,
    ...u.profile,
    lat: u.location?.lat,
    lng: u.location?.lng,
    available: u.profile?.donateBlood || u.profile?.donateOrgan || false
  }));

  if (type === 'blood') {
    results = results.filter((d) => d.donateBlood && d.available);
    if (query) {
      results = results.filter(
        (d) => d.bloodGroup.toLowerCase() === query.toLowerCase()
      );
    }
  } else if (type === 'organ') {
    results = results.filter((d) => d.donateOrgan && d.available);
    if (query) {
      results = results.filter((d) =>
        d.organs.some((o) => o.toLowerCase().includes(query.toLowerCase()))
      );
    }
  }

  // Haversine sorting
  if (lat && lng) {
    const latN = Number(lat);
    const lngN = Number(lng);
    
    const haversine = (lat1, lng1, lat2, lng2) => {
      if (!lat1 || !lng1) return Infinity; // Put those without location at end
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    results = results
      .map((d) => ({
        ...d,
        distance: haversine(d.lat, d.lng, latN, lngN),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  res.json(results);
});

module.exports = { searchNearbyDonors, searchDonors };
