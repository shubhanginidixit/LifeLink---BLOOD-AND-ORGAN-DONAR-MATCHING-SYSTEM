const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: String,

  bloodGroup: String,

  donorType: {
    type: String,
    enum: ["blood", "organ"],
    required: true
  },

  organType: String,

  city: String,

  phone: String,

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },

  available: {
    type: Boolean,
    default: true
  },

  lastDonationDate: {
    type: Date
  }
}, { timestamps: true });

donorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Donor", donorSchema);
