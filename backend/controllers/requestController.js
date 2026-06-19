const asyncHandler = require("express-async-handler");
const Request = require("../models/Request");
const Donor = require("../models/Donor");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const { isUserOnline, emitToUser, emitToAll } = require("../socket");
const { sendPushNotification } = require("../utils/push");

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

  const matchedDonor = await Donor.findOne(matchCriteria).populate("user", "email");

  if (matchedDonor) {
    request.status = "Matched";
    request.matchedDonor = matchedDonor._id;
    await request.save();

    matchedDonor.available = false;
    await matchedDonor.save();

    if (matchedDonor.user) {
      const notification = await Notification.create({
        user: matchedDonor.user._id,
        title: "Match Found!",
        message: `You have been matched with ${hospitalProfile.hospitalName} for a ${requestType} donation.`,
        type: "match"
      });

      emitToUser(matchedDonor.user._id.toString(), "new-notification", {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false,
        createdAt: notification.createdAt,
      });

      if (!isUserOnline(matchedDonor.user._id.toString())) {
        const donorUser = await User.findById(matchedDonor.user._id).select("fcmToken");
        if (donorUser?.fcmToken) {
          const result = await sendPushNotification(
            donorUser.fcmToken,
            notification.title,
            notification.message,
            { redirect: "/dashboard" }
          );
          if (result === "invalid") {
            donorUser.fcmToken = "";
            await donorUser.save();
          }
        }
      }

      if (matchedDonor.user.email) {
        await sendEmail({
          email: matchedDonor.user.email,
          subject: "Urgent: You've been matched for a donation!",
          message: `Hello,\n\nYou have been matched with ${hospitalProfile.hospitalName} for a ${requestType} donation.\n\nPlease contact them immediately at ${hospitalProfile.phone || hospitalProfile.email} to coordinate.`
        });
      }
    }
  } else if (isEmergency) {
    const emergencyDonors = await Donor.find({ city: request.city, available: true }).populate("user", "email");
    
    for (const d of emergencyDonors) {
      if (d.user) {
        const notification = await Notification.create({
          user: d.user._id,
          title: "EMERGENCY in your city!",
          message: `${hospitalProfile.hospitalName} is in critical need of ${bloodGroup || organType}.`,
          type: "emergency"
        });

        emitToUser(d.user._id.toString(), "new-notification", {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false,
          createdAt: notification.createdAt,
        });

        if (!isUserOnline(d.user._id.toString())) {
          const emergencyUser = await User.findById(d.user._id).select("fcmToken");
          if (emergencyUser?.fcmToken) {
            const result = await sendPushNotification(
              emergencyUser.fcmToken,
              notification.title,
              notification.message,
              { redirect: "/dashboard" }
            );
            if (result === "invalid") {
              emergencyUser.fcmToken = "";
              await emergencyUser.save();
            }
          }
        }

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
    .populate("requestedBy", "profile.name profile.bloodGroup profile.city")
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

// @desc    Create a donor request (any authenticated user)
// @route   POST /api/requests/donor
// @access  Private
const createDonorRequest = asyncHandler(async (req, res) => {
  const { requestType, bloodGroup, organType, units, city, isEmergency, urgencyLevel } = req.body;

  if (!requestType) {
    res.status(400);
    throw new Error("Request type is required");
  }

  const userCity = city || req.user.profile?.city || "Unknown";

  let request = await Request.create({
    requestType,
    bloodGroup,
    organType,
    units: units || 1,
    city: userCity,
    status: "Pending",
    isEmergency: isEmergency || false,
    urgencyLevel: urgencyLevel || "medium",
    requestedBy: req.user._id,
  });

  // Find matching donors from User model
  const matchQuery = {
    profileComplete: true,
    "profile.lat": { $exists: true },
    "profile.lng": { $exists: true },
  };

  if (requestType === "blood") {
    matchQuery["profile.bloodGroup"] = bloodGroup;
    matchQuery["profile.donateBlood"] = true;
  } else if (requestType === "organ") {
    matchQuery["profile.donateOrgan"] = true;
    matchQuery["profile.organs"] = { $in: [organType] };
  }

  const matchingUsers = await User.find(matchQuery).select("_id email");

  // Notify matching donors
  for (const matchedUser of matchingUsers) {
    if (matchedUser._id.toString() === req.user._id.toString()) continue;

    const notification = await Notification.create({
      user: matchedUser._id,
      title: isEmergency ? "EMERGENCY Request Near You!" : "New Donation Request",
      message: `A ${requestType} donation request${bloodGroup ? ` for ${bloodGroup}` : ""}${organType ? ` (${organType})` : ""} has been posted in ${userCity}.`,
      type: isEmergency ? "emergency" : "match",
      redirect: "/dashboard",
    });

    emitToUser(matchedUser._id.toString(), "new-notification", {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      redirect: notification.redirect,
      read: false,
      createdAt: notification.createdAt,
    });

    if (!isUserOnline(matchedUser._id.toString())) {
      const user = await User.findById(matchedUser._id).select("fcmToken");
      if (user?.fcmToken) {
        const result = await sendPushNotification(
          user.fcmToken,
          notification.title,
          notification.message,
          { redirect: notification.redirect || "/dashboard" }
        );
        if (result === "invalid") {
          user.fcmToken = "";
          await user.save();
        }
      }
    }

    if (matchedUser.email) {
      try {
        await sendEmail({
          email: matchedUser.email,
          subject: isEmergency
            ? `EMERGENCY: ${requestType} donation needed in ${userCity}`
            : `New ${requestType} donation request in ${userCity}`,
          message: `A ${requestType} donation request has been posted in ${userCity}. Log in to LIFELINK to view details and respond.`,
        });
      } catch (e) {
        // Email send failure is non-critical
      }
    }
  }

  emitToAll("new-request", {
    _id: request._id,
    requestType: request.requestType,
    bloodGroup: request.bloodGroup,
    organType: request.organType,
    city: userCity,
    status: "Pending",
    isEmergency: request.isEmergency,
    urgencyLevel: request.urgencyLevel,
    createdAt: request.createdAt,
    requestedBy: { _id: req.user._id, name: req.user.profile?.name || "User", bloodGroup: req.user.profile?.bloodGroup || "" },
  });

  res.status(201).json(request);
});

// @desc    Get requests created by the logged-in user
// @route   GET /api/requests/mine
// @access  Private
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ requestedBy: req.user._id })
    .sort({ createdAt: -1 });

  res.json(requests);
});

module.exports = {
  createRequest,
  createDonorRequest,
  getMyRequests,
  getRequests,
  updateRequest
};
