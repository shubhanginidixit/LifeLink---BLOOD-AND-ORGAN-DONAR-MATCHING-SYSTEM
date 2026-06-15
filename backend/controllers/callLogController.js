/**
 * @file callLogController.js
 * @description Controller layer for getting, adding, and deleting call history logs.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

const asyncHandler = require("express-async-handler");
const CallLog = require("../models/CallLog");

// @desc    Get all call logs for the current user
// @route   GET /api/calls
// @access  Private
const getCallLogs = asyncHandler(async (req, res) => {
  const logs = await CallLog.find({ user: req.user._id }).sort({ timestamp: -1 });
  res.json(logs);
});

// @desc    Add a new call log entry
// @route   POST /api/calls
// @access  Private
const addCallLog = asyncHandler(async (req, res) => {
  const { donorId, bloodGroup, age, gender, city, type, direction } = req.body;

  if (!donorId || !bloodGroup || !age || !gender || !city || !type) {
    res.status(400);
    throw new Error("Missing required fields for call log");
  }

  const log = await CallLog.create({
    user: req.user._id,
    donorId,
    bloodGroup,
    age,
    gender,
    city,
    type,
    direction: direction || "outgoing"
  });

  res.status(201).json(log);
});

// @desc    Delete a call log entry
// @route   DELETE /api/calls/:id
// @access  Private
const deleteCallLog = asyncHandler(async (req, res) => {
  const log = await CallLog.findOne({ _id: req.params.id, user: req.user._id });

  if (!log) {
    res.status(404);
    throw new Error("Call log entry not found or unauthorized");
  }

  await CallLog.deleteOne({ _id: req.params.id });

  res.json({ success: true });
});

module.exports = {
  getCallLogs,
  addCallLog,
  deleteCallLog
};
