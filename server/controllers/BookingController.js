const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Payment = require("../models/Payment");
const {createNotification} = require("./NotificationController");

const createBooking = async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      withDriver = false,
      specialRequests = "",
    } = req.body;

    if (
      !mongoose.isValidObjectId(vehicleId) ||
      !startDate ||
      !endDate ||
      typeof withDriver !== "boolean"
    ) {
      return res.status(400).json({
        message: "Invalid booking details",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start >= end ||
      start < new Date()
    ) {
      return res.status(400).json({
        message: "Invalid rental dates",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle || vehicle.verification.status !== "verified") {
      return res.status(404).json({
        message: "Vehicle not available",
      });
    }

    if (vehicle.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot book your own vehicle",
      });
    }

    if (withDriver && !vehicle.driverAvailable) {
      return res.status(400).json({
        message: "Driver is not available for this vehicle",
      });
    }

    const isWithinAvailability = vehicle.availability.some(
      (range) => start >= range.startDate && end <= range.endDate,
    );

    if (!isWithinAvailability) {
      return res.status(400).json({
        message: "Vehicle is not available for the selected dates",
      });
    }

    const conflictingBooking = await Booking.findOne({
      vehicle: vehicleId,
      status: {$in: ["pending", "approved"]},
      startDate: {$lt: end},
      endDate: {$gt: start},
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: "Vehicle is already booked for these dates",
      });
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const rentalDays = Math.ceil(
      (end.getTime() - start.getTime()) / millisecondsPerDay,
    );

    const vehiclePricePerDay = vehicle.rentalPricePerDay;

    const driverPricePerDay = withDriver ? vehicle.driverPricePerDay : 0;

    const totalAmount = rentalDays * (vehiclePricePerDay + driverPricePerDay);

    const booking = await Booking.create({
      renter: req.user._id,
      vehicle: vehicle._id,
      startDate: start,
      endDate: end,
      withDriver,
      rentalDays,
      vehiclePricePerDay,
      driverPricePerDay,
      totalAmount,
      specialRequests,
    });

    await createNotification({
      recipient: vehicle.owner,
      type: "booking_created",
      title: "New Booking Request",
      message: `You received a new booking request for your ${vehicle.make} ${vehicle.model}.`,
      relatedBooking: booking._id,
      relatedVehicle: vehicle._id,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const {status} = req.query;

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "cancelled",
      "completed",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    const query = {
      renter: req.user._id,
    };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: "vehicle",
        select:
          "make model year images location rentalPricePerDay averageRating",
      })
      .sort({createdAt: -1});

    res.status(200).json({
      message: "Bookings fetched successfully",
      count: bookings.length,
      status: status || "all",
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const {status, paymentStatus, vehicleId, date} = req.query;

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "cancelled",
      "completed",
    ];

    const validPaymentStatuses = [
      "unpaid",
      "pending",
      "partially_paid",
      "paid",
      "refunded",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    if (vehicleId && !mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    if (date && !["upcoming", "past"].includes(date)) {
      return res.status(400).json({
        message: "Invalid date filter. Use upcoming or past",
      });
    }

    const vehicles = await Vehicle.find({
      owner: req.user._id,
    }).select("_id");

    const vehicleIds = vehicles.map((vehicle) => vehicle._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        message: "Owner bookings fetched successfully",
        count: 0,
        status: status || "all",
        paymentStatus: paymentStatus || "all",
        vehicleId: vehicleId || "all",
        date: date || "all",
        bookings: [],
      });
    }

    const query = {
      vehicle: {
        $in: vehicleId ? [new mongoose.Types.ObjectId(vehicleId)] : vehicleIds,
      },
    };

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const now = new Date();

    if (date === "upcoming") {
      query.startDate = {
        $gte: now,
      };
    }

    if (date === "past") {
      query.endDate = {
        $lt: now,
      };
    }

    const bookings = await Booking.find(query)
      .populate(
        "vehicle",
        "make model year images location rentalPricePerDay averageRating",
      )
      .populate("renter", "name profileImage trustScore")
      .sort({createdAt: -1});

    return res.status(200).json({
      message: "Owner bookings fetched successfully",
      count: bookings.length,
      status: status || "all",
      paymentStatus: paymentStatus || "all",
      vehicleId: vehicleId || "all",
      date: date || "all",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch owner bookings",
      error: error.message,
    });
  }
};

const reviewBooking = async (req, res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const booking = await Booking.findById(id).populate("vehicle");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      !booking.vehicle ||
      booking.vehicle.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to review this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be reviewed",
      });
    }

    if (status === "approved") {
      if (booking.startDate <= new Date()) {
        return res.status(400).json({
          message: "Cannot approve a booking that has already started",
        });
      }

      const isAvailable = booking.vehicle.availability.some(
        (range) =>
          booking.startDate >= range.startDate &&
          booking.endDate <= range.endDate,
      );

      if (!isAvailable) {
        return res.status(400).json({
          message: "Vehicle is no longer available for these dates",
        });
      }

      const conflictingBooking = await Booking.findOne({
        _id: {$ne: booking._id},
        vehicle: booking.vehicle._id,
        status: "approved",
        startDate: {$lt: booking.endDate},
        endDate: {$gt: booking.startDate},
      });

      if (conflictingBooking) {
        return res.status(409).json({
          message: "Another booking is already approved for these dates",
        });
      }
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: "pending",
      },
      {
        $set: {
          status,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("vehicle", "make model year images location")
      .populate("renter", "name profileImage trustScore");

    if (!updatedBooking) {
      return res.status(409).json({
        message: "This booking has already been reviewed",
      });
    }

    await createNotification({
      recipient: updatedBooking.renter._id,
      type: status === "approved" ? "booking_approved" : "booking_rejected",
      title: status === "approved" ? "Booking Approved" : "Booking Rejected",
      message:
        status === "approved" ?
          "Your vehicle booking has been approved by the owner."
        : "Your vehicle booking has been rejected by the owner.",
      relatedBooking: updatedBooking._id,
      relatedVehicle: updatedBooking.vehicle._id,
    });

    res.status(200).json({
      message: `Booking ${status} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Review booking error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const {id} = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id).populate(
      "vehicle",
      "make model year images location owner",
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking",
      });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({
        message: "Only pending or approved bookings can be cancelled",
      });
    }

    const now = new Date();

    if (booking.startDate <= now) {
      return res.status(400).json({
        message: "Cannot cancel a booking after its start time",
      });
    }

    if (booking.paymentStatus === "pending") {
      return res.status(409).json({
        message: "Payment is still being processed",
      });
    }

    if (!["unpaid", "partially_paid", "paid"].includes(booking.paymentStatus)) {
      return res.status(400).json({
        message: "Booking cannot be cancelled in its current payment state",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      renter: req.user._id,
    });

    if (
      booking.paymentStatus === "partially_paid" ||
      booking.paymentStatus === "paid"
    ) {
      if (!payment) {
        return res.status(409).json({
          message: "Payment record not found",
        });
      }

      if (payment.paidAmount <= 0) {
        return res.status(409).json({
          message: "No paid amount available for refund",
        });
      }
    }

    const paidAmount = payment ? payment.paidAmount : 0;

    const needsRefund = paidAmount > 0;

    const cancelledBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        renter: req.user._id,
        status: {$in: ["pending", "approved"]},
        paymentStatus: {
          $in: ["unpaid", "partially_paid", "paid"],
        },
        startDate: {$gt: now},
      },
      {
        $set: {
          status: "cancelled",
          paymentStatus: needsRefund ? "refunded" : "unpaid",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("vehicle", "make model year images location");

    if (!cancelledBooking) {
      return res.status(409).json({
        message: "Booking can no longer be cancelled",
      });
    }

    if (needsRefund) {
      const refundTransactionId = `RIDEX-REFUND-${Date.now()}`;

      const refundedPayment = await Payment.findOneAndUpdate(
        {
          booking: booking._id,
          renter: req.user._id,
          status: {
            $in: ["partially_paid", "paid"],
          },
        },
        {
          $set: {
            status: "refunded",
            transactionId: refundTransactionId,
            refundedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!refundedPayment) {
        await Booking.findByIdAndUpdate(
          booking._id,
          {
            $set: {
              status: "cancelled",
              paymentStatus: booking.paymentStatus,
            },
          },
          {
            runValidators: true,
          },
        );

        return res.status(409).json({
          message: "Booking cancelled, but refund could not be processed",
        });
      }

      await createNotification({
        recipient: booking.vehicle.owner,
        type: "booking_cancelled",
        title: "Booking Cancelled",
        message: "A renter has cancelled their booking.",
        relatedBooking: booking._id,
        relatedVehicle: booking.vehicle._id,
      });

      await createNotification({
        recipient: booking.renter,
        type: "payment_refunded",
        title: "Payment Refunded",
        message: `₹${paidAmount} has been refunded for your cancelled booking.`,
        relatedBooking: booking._id,
        relatedVehicle: booking.vehicle._id,
      });

      return res.status(200).json({
        message: "Booking cancelled and payment refunded successfully",
        refundAmount: paidAmount,
        totalBookingAmount: booking.totalAmount,
        booking: cancelledBooking,
        payment: refundedPayment,
      });
    }

    await createNotification({
      recipient: booking.vehicle.owner,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: "A renter has cancelled their booking.",
      relatedBooking: booking._id,
      relatedVehicle: booking.vehicle._id,
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
      refundAmount: 0,
      totalBookingAmount: booking.totalAmount,
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const {id} = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id).populate("vehicle");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      !booking.vehicle ||
      booking.vehicle.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to complete this booking",
      });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Only approved bookings can be completed",
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Booking must be paid before it can be completed",
      });
    }

    const now = new Date();

    if (booking.endDate > now) {
      return res.status(400).json({
        message: "Booking cannot be completed before the rental ends",
      });
    }

    const completedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: "approved",
        paymentStatus: "paid",
        endDate: {$lte: now},
      },
      {
        $set: {
          status: "completed",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(
        "vehicle",
        "make model year images location averageRating totalReviews",
      )
      .populate("renter", "name profileImage trustScore");

    if (!completedBooking) {
      return res.status(409).json({
        message: "Booking can no longer be completed",
      });
    }

    await createNotification({
      recipient: completedBooking.renter._id,
      type: "booking_completed",
      title: "Booking Completed",
      message: "Your vehicle booking has been completed.",
      relatedBooking: completedBooking._id,
      relatedVehicle: completedBooking.vehicle._id,
    });

    res.status(200).json({
      message: "Booking completed successfully",
      booking: completedBooking,
    });
  } catch (error) {
    console.error("Complete booking error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const {id} = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id)
      .populate({
        path: "vehicle",
        select:
          "make model year vehicleType fuelType transmission seatingCapacity images location rentalPricePerDay driverAvailable driverPricePerDay averageRating totalReviews owner",
      })
      .populate({
        path: "renter",
        select: "name profileImage trustScore",
      });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const isRenter = booking.renter._id.toString() === req.user._id.toString();

    const isOwner =
      booking.vehicle &&
      booking.vehicle.owner.toString() === req.user._id.toString();

    if (!isRenter && !isOwner) {
      return res.status(403).json({
        message: "You are not authorized to view this booking",
      });
    }

    res.status(200).json({
      message: "Booking details fetched successfully",
      booking,
    });
  } catch (error) {
    console.error("Get booking details error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const ownerCancelBooking = async (req, res) => {
  try {
    const {id} = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id).populate("vehicle");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      !booking.vehicle ||
      booking.vehicle.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking",
      });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({
        message: "Only pending or approved bookings can be cancelled",
      });
    }

    const now = new Date();

    if (booking.startDate <= now) {
      return res.status(400).json({
        message: "Cannot cancel a booking after it has started",
      });
    }

    if (booking.paymentStatus === "pending") {
      return res.status(409).json({
        message: "Payment is still being processed",
      });
    }

    if (!["unpaid", "partially_paid", "paid"].includes(booking.paymentStatus)) {
      return res.status(400).json({
        message: "Booking cannot be cancelled in its current payment state",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      renter: booking.renter,
    });

    if (
      booking.paymentStatus === "partially_paid" ||
      booking.paymentStatus === "paid"
    ) {
      if (!payment) {
        return res.status(409).json({
          message: "Payment record not found",
        });
      }

      if (payment.paidAmount <= 0) {
        return res.status(409).json({
          message: "No paid amount available for refund",
        });
      }
    }

    const paidAmount = payment ? payment.paidAmount : 0;

    const needsRefund = paidAmount > 0;

    const cancelledBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: {$in: ["pending", "approved"]},
        paymentStatus: {
          $in: ["unpaid", "partially_paid", "paid"],
        },
        startDate: {$gt: now},
      },
      {
        $set: {
          status: "cancelled",
          paymentStatus: needsRefund ? "refunded" : "unpaid",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("vehicle", "make model year images location")
      .populate("renter", "name profileImage trustScore");

    if (!cancelledBooking) {
      return res.status(409).json({
        message: "Booking can no longer be cancelled",
      });
    }

    let refundedPayment = null;

    if (needsRefund) {
      const refundTransactionId = `RIDEX-REFUND-${Date.now()}`;

      refundedPayment = await Payment.findOneAndUpdate(
        {
          booking: booking._id,
          renter: booking.renter,
          status: {
            $in: ["partially_paid", "paid"],
          },
        },
        {
          $set: {
            status: "refunded",
            transactionId: refundTransactionId,
            refundedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!refundedPayment) {
        await Booking.findByIdAndUpdate(
          booking._id,
          {
            $set: {
              status: "cancelled",
              paymentStatus: booking.paymentStatus,
            },
          },
          {
            runValidators: true,
          },
        );

        return res.status(409).json({
          message: "Booking cancelled, but refund could not be processed",
        });
      }
    }

    await createNotification({
      recipient: booking.renter,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: "The vehicle owner has cancelled your booking.",
      relatedBooking: booking._id,
      relatedVehicle: booking.vehicle._id,
    });

    if (needsRefund) {
      await createNotification({
        recipient: booking.renter,
        type: "payment_refunded",
        title: "Payment Refunded",
        message: `₹${paidAmount} has been refunded because the owner cancelled your booking.`,
        relatedBooking: booking._id,
        relatedVehicle: booking.vehicle._id,
      });
    }

    return res.status(200).json({
      message:
        needsRefund ?
          "Booking cancelled by owner and payment refunded successfully"
        : "Booking cancelled by owner successfully",
      refundAmount: paidAmount,
      booking: cancelledBooking,
      payment: refundedPayment,
    });
  } catch (error) {
    console.error("Owner cancel booking error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getOwnerEarnings = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const vehicles = await Vehicle.find({owner: ownerId}).select(
      "_id make model",
    );

    const vehicleIds = vehicles.map((vehicle) => vehicle._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        message: "Owner earnings fetched successfully",
        summary: {
          totalEarnings: 0,
          totalCompletedBookings: 0,
          currentMonthEarnings: 0,
        },
        monthlyEarnings: [],
        vehicleEarnings: [],
      });
    }

    const completedBookings = await Booking.find({
      vehicle: {$in: vehicleIds},
      status: "completed",
      paymentStatus: "paid",
    })
      .populate("vehicle", "make model")
      .sort({endDate: -1});

    let totalEarnings = 0;
    let currentMonthEarnings = 0;

    const now = new Date();

    const vehicleEarningsMap = {};
    const monthlyEarningsMap = {};

    completedBookings.forEach((booking) => {
      const amount = booking.totalAmount || 0;

      totalEarnings += amount;

      const bookingDate = new Date(booking.endDate);

      if (
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
      ) {
        currentMonthEarnings += amount;
      }

      const vehicleId = booking.vehicle._id.toString();

      if (!vehicleEarningsMap[vehicleId]) {
        vehicleEarningsMap[vehicleId] = {
          vehicleId,
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          totalEarnings: 0,
          completedBookings: 0,
        };
      }

      vehicleEarningsMap[vehicleId].totalEarnings += amount;
      vehicleEarningsMap[vehicleId].completedBookings += 1;

      const monthKey = `${bookingDate.getFullYear()}-${String(
        bookingDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!monthlyEarningsMap[monthKey]) {
        monthlyEarningsMap[monthKey] = {
          month: monthKey,
          totalEarnings: 0,
          completedBookings: 0,
        };
      }

      monthlyEarningsMap[monthKey].totalEarnings += amount;
      monthlyEarningsMap[monthKey].completedBookings += 1;
    });

    const vehicleEarnings = Object.values(vehicleEarningsMap).sort(
      (a, b) => b.totalEarnings - a.totalEarnings,
    );

    const monthlyEarnings = Object.values(monthlyEarningsMap).sort((a, b) =>
      b.month.localeCompare(a.month),
    );

    return res.status(200).json({
      message: "Owner earnings fetched successfully",
      summary: {
        totalEarnings,
        totalCompletedBookings: completedBookings.length,
        currentMonthEarnings,
      },
      monthlyEarnings,
      vehicleEarnings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch owner earnings",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  reviewBooking,
  cancelBooking,
  completeBooking,
  getBookingById,
  ownerCancelBooking,
  getOwnerEarnings,
};
