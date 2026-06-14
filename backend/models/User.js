const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["donor", "hospital", "admin"],
    default: "donor"
  },

  profileComplete: {
    type: Boolean,
    default: false
  },

  profile: {
    name: { type: String, default: "" },
    dob: { type: String, default: "" },
    age: { type: Number, default: null },
    bloodGroup: { type: String, default: "" },
    gender: { type: String, default: "" },
    weight: { type: String, default: "" },
    smoker: { type: Boolean, default: false },
    alcoholic: { type: Boolean, default: false },
    illnesses: { type: String, default: "" },
    donateBlood: { type: Boolean, default: false },
    donateOrgan: { type: Boolean, default: false },
    organs: { type: [String], default: [] },
    eligibilityFile: { type: String, default: "" }, // Base64 data URI
    eligibilityFileName: { type: String, default: "" },
    eligibilityFileType: { type: String, default: "" },
    eligibilityStatus: {
      type: String,
      enum: ["none", "processing", "verified", "failed"],
      default: "none"
    },
    lat: { type: Number, default: 18.5204 }, // Default Pune
    lng: { type: Number, default: 73.8567 },
    city: { type: String, default: "Pune" },
    pincode: { type: String, default: "411001" }
  },

  blockedIds: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
