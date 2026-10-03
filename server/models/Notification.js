const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_approved",
        "booking_rejected",
        "booking_cancelled",
        "booking_completed",
        "payment_created",
        "payment_partial",
        "payment_completed",
        "payment_refunded",
        "vehicle_verification_requested",
        "vehicle_verification_approved",
        "vehicle_verification_rejected",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    relatedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true},
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Notification", notificationSchema);
