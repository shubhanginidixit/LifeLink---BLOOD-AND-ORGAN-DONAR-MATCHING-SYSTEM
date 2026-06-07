const asyncHandler = require("express-async-handler");
const Request = require("../models/Request");
const Donor = require("../models/Donor");
const Hospital = require("../models/Hospital");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");

// @desc    Create a new donation request
// @route   POST /api/requests
// @access  Private (Hospital only)
const createRequest = asyncHandler(async (req, res) => {
  const hospitalProfile = await Hospital.findOne({ user: req.user._id });
  
  if (!hospitalProfile) {
    res.status(400);
    throw new Error("Only registered hospitals can create requests");
  }

  const { requestType, bloodGroup, organType, units, city, isEmergency, urgencyLevel } = req.body;

  let request = await Request.create({
    requestType,
    bloodGroup,
    organType,
    units,
    city: city || hospitalProfile.city,
    hospital: hospitalProfile._id,
    status: "Pending",
    isEmergency: isEmergency || false,
    urgencyLevel: urgencyLevel || "medium"
  });

  // --- AUTOMATED MATCHING ALGORITHM ---
  const matchCriteria = {
    donorType: requestType,
    city: request.city,
    available: true,
  };

  if (requestType === "blood") {
    matchCriteria.bloodGroup = bloodGroup;
  } else if (requestType === "organ") {
    matchCriteria.organType = organType;
  }

  const matchedDonor = await Donor.findOne(matchCriteria).populate("user", "email fullName");

  if (matchedDonor) {
    request.status = "Matched";
    request.matchedDonor = matchedDonor._id;
    await request.save();

    matchedDonor.available = false;
    await matchedDonor.save();

    if (matchedDonor.user) {
      await Notification.create({
        user: matchedDonor.user._id,
        title: "Match Found!",
        message: `You have been matched with ${hospitalProfile.hospitalName} for a ${requestType} donation.`,
        type: "match"
      });

      if (matchedDonor.user.email) {
        await sendEmail({
          email: matchedDonor.user.email,
          subject: "Urgent: You've been matched for a donation!",
          message: `Hello ${matchedDonor.user.fullName},\n\nYou have been matched with ${hospitalProfile.hospitalName} for a ${requestType} donation.\n\nPlease contact them immediately at ${hospitalProfile.phone || hospitalProfile.email} to coordinate.`
        });
      }
    }
  } else if (isEmergency) {
    const emergencyDonors = await Donor.find({ city: request.city, available: true }).populate("user", "email fullName");
    
    for (const d of emergencyDonors) {
      if (d.user) {
        await Notification.create({
          user: d.user._id,
          title: "EMERGENCY in your city!",
          message: `${hospitalProfile.hospitalName} is in critical need of ${bloodGroup || organType}.`,
          type: "emergency"
        });

        if (d.user.email) {
          await sendEmail({
            email: d.user.email,
            subject: "EMERGENCY ALERT: Immediate Donation Needed in Your City!",
            message: `URGENT: ${hospitalProfile.hospitalName} in ${request.city} is in critical need of ${bloodGroup || organType}. If you are able to help, please contact them immediately at ${hospitalProfile.phone || hospitalProfile.email}.`
          });
        }
      }
    }
  }

  request = await Request.findById(request._id)
    .populate("hospital", "hospitalName phone email city")
    .populate("matchedDonor", "name phone bloodGroup organType city");

  res.status(201).json(request);
});

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
const getRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find()
    .populate("hospital", "hospitalName city phone")
    .populate("matchedDonor", "name phone")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// @desc    Update request status
// @route   PATCH /api/requests/:id
// @access  Private (Hospital only)
const updateRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  // Ensure only the hospital that created it can update it
  const hospitalProfile = await Hospital.findOne({ user: req.user._id });
  if (!hospitalProfile || request.hospital.toString() !== hospitalProfile._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this request");
  }

  const updatedRequest = await Request.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
    .populate("hospital", "hospitalName")
    .populate("matchedDonor", "name");

  res.json(updatedRequest);
});

module.exports = {
  createRequest,
  getRequests,
  updateRequest
};
