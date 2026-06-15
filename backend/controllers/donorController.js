/**
 * @file donorController.js
 * @description Controller layer for searching and listing available blood and organ donors.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

const asyncHandler = require("express-async-handler");
const Donor = require("../models/Donor");

// @desc    Register a donor profile
// @route   POST /api/donors
// @access  Private (Donor only)
const registerDonor = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  const existingDonor = await Donor.findOne({ user: req.user._id });
  if (existingDonor) {
    res.status(400);
    throw new Error("User already has a donor profile");
  }

  const donor = await Donor.create(req.body);
  res.status(201).json(donor);
});

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private
const getDonors = asyncHandler(async (req, res) => {
  const donors = await Donor.find().populate("user", "fullName email");
  res.json(donors);
});

// @desc    Get donors by blood group
// @route   GET /api/donors/blood/:group
// @access  Private
const getDonorsByBloodGroup = asyncHandler(async (req, res) => {
  const donors = await Donor.find({
    bloodGroup: req.params.group
  }).populate("user", "fullName email");
  res.json(donors);
});

// @desc    Get logged in donor profile
// @route   GET /api/donors/me
// @access  Private (Donor only)
const getMyProfile = asyncHandler(async (req, res) => {
  const donor = await Donor.findOne({ user: req.user._id }).populate("user", "fullName email");
  if (!donor) {
    res.status(404);
    throw new Error("Donor profile not found");
  }
  res.json(donor);
});

// @desc    Update logged in donor profile
// @route   PUT /api/donors/me
// @access  Private (Donor only)
const updateDonor = asyncHandler(async (req, res) => {
  let donor = await Donor.findOne({ user: req.user._id });

  if (!donor) {
    res.status(404);
    throw new Error("Donor profile not found");
  }

  donor = await Donor.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  res.json(donor);
});

module.exports = {
  registerDonor,
  getDonors,
  getDonorsByBloodGroup,
  getMyProfile,
  updateDonor
};
