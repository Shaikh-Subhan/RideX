const mongoose = require("mongoose");

const vehicleReviewSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },

    renter: {
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
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

vehicleReviewSchema.index({
  vehicle: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "VehicleReview",
  vehicleReviewSchema
);