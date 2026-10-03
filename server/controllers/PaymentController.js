const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const {createNotification} = require("./NotificationController");

const createPayment = async (req, res) => {
  try {
    const {bookingId} = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Valid booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only pay for your own bookings",
      });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Only approved bookings can be paid",
      });
    }

    if (
      booking.paymentStatus === "paid" ||
      booking.paymentStatus === "refunded"
    ) {
      return res.status(400).json({
        message: "Payment cannot be created for this booking",
      });
    }

    let payment = await Payment.findOne({
      booking: booking._id,
    });

    if (payment) {
      return res.status(200).json({
        message: "Payment already exists",
        payment,
      });
    }

    payment = await Payment.create({
      booking: booking._id,
      renter: booking.renter,
      totalAmount: booking.totalAmount,
      paidAmount: 0,
      remainingAmount: booking.totalAmount,
      method: "demo",
      status: "created",
    });

    await Booking.findByIdAndUpdate(booking._id, {
      paymentStatus: "pending",
    });

    await createNotification({
      recipient: booking.renter,
      type: "payment_created",
      title: "Payment Created",
      message: `Payment has been created for your booking. Total amount: ₹${booking.totalAmount}.`,
      relatedBooking: booking._id,
    });

    return res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

const processDemoPayment = async (req, res) => {
  try {
    const {amount} = req.body;

    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        message: "Payment amount is required",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const booking = await Booking.findById(payment.booking).populate(
      "vehicle",
      "make model owner",
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (payment.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only pay your own payment",
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        message: "Payment is already fully paid",
      });
    }

    if (payment.status === "refunded") {
      return res.status(400).json({
        message: "Refunded payment cannot be paid again",
      });
    }

    if (paymentAmount > payment.remainingAmount) {
      return res.status(400).json({
        message: "Payment amount cannot be greater than remaining amount",
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        remainingAmount: payment.remainingAmount,
        requestedAmount: paymentAmount,
      });
    }

    const newPaidAmount = payment.paidAmount + paymentAmount;
    const newRemainingAmount = payment.totalAmount - newPaidAmount;

    const isFullyPaid = newRemainingAmount === 0;

    payment.paidAmount = newPaidAmount;
    payment.remainingAmount = newRemainingAmount;
    payment.status = isFullyPaid ? "paid" : "partially_paid";
    payment.transactionId = `RIDEX-DEMO-${Date.now()}`;
    payment.paidAt = isFullyPaid ? new Date() : payment.paidAt;

    await payment.save();

    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: isFullyPaid ? "paid" : "partially_paid",
    });

    if (isFullyPaid) {
  await createNotification({
    recipient: payment.renter,
    type: "payment_completed",
    title: "Payment Completed",
    message: `Your full payment of ₹${payment.totalAmount} has been completed successfully.`,
    relatedBooking: payment.booking,
    relatedVehicle: booking.vehicle._id
  });

  await createNotification({
    recipient: booking.vehicle.owner,
    type: "payment_completed",
    title: "Booking Payment Received",
    message: `Full payment of ₹${payment.totalAmount} has been received for your ${booking.vehicle.make} ${booking.vehicle.model}.`,
    relatedBooking: payment.booking,
    relatedVehicle: booking.vehicle._id
  });
} else {
  await createNotification({
    recipient: payment.renter,
    type: "payment_partial",
    title: "Partial Payment Received",
    message: `₹${paymentAmount} paid successfully. Remaining amount: ₹${payment.remainingAmount}.`,
    relatedBooking: payment.booking,
    relatedVehicle: booking.vehicle._id
  });

    await createNotification({
    recipient: booking.vehicle.owner,
    type: "payment_partial",
    title: "Partial Payment Received",
    message: `Partial payment of ₹${paymentAmount} has been received for your ${booking.vehicle.make} ${booking.vehicle.model}. Remaining amount: ₹${payment.remainingAmount}.`,
    relatedBooking: payment.booking,
    relatedVehicle: booking.vehicle._id
  });

}

    return res.status(200).json({
      message:
        isFullyPaid ?
          "Full payment completed successfully"
        : "Partial payment completed successfully",
      payment: {
        _id: payment._id,
        booking: payment.booking,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        remainingAmount: payment.remainingAmount,
        currency: payment.currency,
        status: payment.status,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

const processDemoRefund = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only refund your own payment",
      });
    }

    if (payment.paidAmount <= 0) {
      return res.status(400).json({
        message: "There is no paid amount to refund",
      });
    }

    if (payment.status === "refunded") {
      return res.status(400).json({
        message: "Payment is already refunded",
      });
    }

    const refundAmount = payment.paidAmount;

    payment.status = "refunded";
    payment.transactionId = `RIDEX-REFUND-${Date.now()}`;
    payment.refundedAt = new Date();
    payment.remainingAmount = payment.totalAmount - refundAmount;

    await payment.save();

    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: "refunded",
    });

    await createNotification({
  recipient: payment.renter,
  type: "payment_refunded",
  title: "Payment Refunded",
  message: `₹${refundAmount} has been refunded for your booking.`,
  relatedBooking: payment.booking
});

    return res.status(200).json({
      message: "Payment refunded successfully",
      refundAmount,
      payment: {
        _id: payment._id,
        booking: payment.booking,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        remainingAmount: payment.remainingAmount,
        status: payment.status,
        transactionId: payment.transactionId,
        refundedAt: payment.refundedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process refund",
      error: error.message,
    });
  }
};

const getPaymentByBooking = async (req, res) => {
  try {
    const {bookingId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only view your own payment",
      });
    }

    const payment = await Payment.findOne({
      booking: bookingId,
    })
      .populate("booking", "startDate endDate totalAmount status paymentStatus")
      .populate("renter", "name email profileImage");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      message: "Payment fetched successfully",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      renter: req.user._id,
    })
      .populate("booking", "startDate endDate totalAmount status paymentStatus")
      .sort({createdAt: -1});

    return res.status(200).json({
      message: "Payment history fetched successfully",
      count: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  processDemoPayment,
  processDemoRefund,
  getPaymentByBooking,
  getMyPayments,
};
