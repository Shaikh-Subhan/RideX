const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },
    method: {
      type: String,
      enum: ["demo"],
      default: "demo"
    },
    status: {
      type: String,
      enum: [
        "created",
        "partially_paid",
        "paid",
        "failed",
        "refunded"
      ],
      default: "created"
    },
    transactionId: {
      type: String,
      default: ""
    },
    paidAt: {
      type: Date,
      default: null
    },
    refundedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);