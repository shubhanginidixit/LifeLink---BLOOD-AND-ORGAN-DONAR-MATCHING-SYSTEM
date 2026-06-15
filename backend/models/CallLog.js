const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  donorId: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["blood", "organ"],
    required: true
  },
  direction: {
    type: String,
    enum: ["outgoing", "incoming"],
    default: "outgoing"
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CallLog", callLogSchema);
