const asyncHandler = require("express-async-handler");
const Hospital = require("../models/Hospital");

// @desc    Register a hospital profile
// @route   POST /api/hospitals
// @access  Private (Hospital only)
const registerHospital = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  const existingHospital = await Hospital.findOne({ user: req.user._id });
  if (existingHospital) {
    res.status(400);
    throw new Error("User already has a hospital profile");
  }

  const hospital = await Hospital.create(req.body);
  res.status(201).json(hospital);
});

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Private
const getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find().populate("user", "fullName email");
  res.json(hospitals);
});

// @desc    Get logged in hospital profile
// @route   GET /api/hospitals/me
// @access  Private (Hospital only)
const getMyHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user._id }).populate("user", "fullName email");
  if (!hospital) {
    res.status(404);
    throw new Error("Hospital profile not found");
  }
  res.json(hospital);
});

module.exports = {
  registerHospital,
  getHospitals,
  getMyHospital
};
