const asyncHandler = require("express-async-handler");
const Donor = require("../models/Donor");
const Hospital = require("../models/Hospital");
const Request = require("../models/Request");

// @desc    Get top-level KPI stats
// @route   GET /api/dashboard/stats
// @access  Public
const getStats = asyncHandler(async (req, res) => {
  const totalDonors = await Donor.countDocuments();
  const registeredHospitals = await Hospital.countDocuments();
  const activeRequests = await Request.countDocuments({ status: "Pending" });
  const successfulMatches = await Request.countDocuments({
    status: { $in: ["Matched", "Fulfilled"] }
  });

  res.json({
    totalDonors,
    activeRequests,
    successfulMatches,
    registeredHospitals,
  });
});

// @desc    Get donor distribution by blood group
// @route   GET /api/dashboard/blood-distribution
// @access  Public
const getBloodDistribution = asyncHandler(async (req, res) => {
  const distribution = await Donor.aggregate([
    { $match: { donorType: "blood" } },
    { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
  ]);
  res.json(distribution);
});

// @desc    Get monthly request trends
// @route   GET /api/dashboard/monthly-trends
// @access  Public
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const trends = await Request.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  res.json(trends);
});

// @desc    Get organ donation summary
// @route   GET /api/dashboard/organ-summary
// @access  Public
const getOrganSummary = asyncHandler(async (req, res) => {
  const summary = await Donor.aggregate([
    { $match: { donorType: "organ", organType: { $exists: true, $ne: "" } } },
    { $group: { _id: "$organType", count: { $sum: 1 } } }
  ]);
  res.json(summary);
});

module.exports = {
  getStats,
  getBloodDistribution,
  getMonthlyTrends,
  getOrganSummary
};
