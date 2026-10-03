const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    withDriver: {
      type: Boolean,
      default: false
    },

    rentalDays: {
      type: Number,
      required: true,
      min: 1
    },

    vehiclePricePerDay: {
      type: Number,
      required: true,
      min: 0
    },

    driverPricePerDay: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed"
      ],
      default: "pending"
    },

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "pending",
        "partially_paid",
        "paid",
        "refunded"
      ],
      default: "unpaid"
    },

    specialRequests: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({
  vehicle: 1,
  startDate: 1,
  endDate: 1
});

bookingSchema.index({
  renter: 1,
  createdAt: -1
});

bookingSchema.index({
  status: 1,
  paymentStatus: 1
});

module.exports = mongoose.model("Booking", bookingSchema);