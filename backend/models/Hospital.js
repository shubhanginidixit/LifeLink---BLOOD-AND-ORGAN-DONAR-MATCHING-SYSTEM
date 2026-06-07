const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    hospitalName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: String,

    city: String,

    address: String,

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

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

hospitalSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
  "Hospital",
  hospitalSchema
);
