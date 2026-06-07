const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    requestType: {
      type: String,
      enum: ["blood", "organ"],
      required: true,
    },

    bloodGroup: String,

    organType: String,

    units: Number,

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Hospital",
    },

    matchedDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
    },

    city: String,

    status: {
      type: String,
      enum: [
        "Pending",
        "Matched",
        "Fulfilled",
      ],
      default: "Pending",
    },

    isEmergency: {
      type: Boolean,
      default: false
    },

    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Request",
  requestSchema
);
