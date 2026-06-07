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

    hospital: String,

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
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Request",
  requestSchema
);
