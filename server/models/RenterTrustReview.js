const mongoose = require("mongoose");

const renterTrustReviewSchema = new mongoose.Schema(
  {
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    review: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

renterTrustReviewSchema.index({
  renter: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "RenterTrustReview",
  renterTrustReviewSchema
);