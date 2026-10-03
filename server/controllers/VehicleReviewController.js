const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const VehicleReview = require("../models/VehicleReview");
const Vehicle = require("../models/Vehicle");

const createVehicleReview = async (req, res) => {
  try {
    const { bookingId, rating, review = "" } = req.body;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID"
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be an integer between 1 and 5"
      });
    }

    if (typeof review !== "string") {
      return res.status(400).json({
        message: "Review must be text"
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to review this booking"
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        message: "Only completed bookings can be reviewed"
      });
    }

    const existingReview = await VehicleReview.findOne({
      booking: booking._id
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this booking"
      });
    }

    const vehicle = await Vehicle.findById(booking.vehicle);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    const newReview = await VehicleReview.create({
      vehicle: vehicle._id,
      renter: req.user._id,
      booking: booking._id,
      rating: numericRating,
      review
    });

    const ratingStats = await VehicleReview.aggregate([
      {
        $match: {
          vehicle: vehicle._id
        }
      },
      {
        $group: {
          _id: "$vehicle",
          averageRating: {
            $avg: "$rating"
          },
          totalReviews: {
            $sum: 1
          }
        }
      }
    ]);

    const averageRating = ratingStats.length
      ? Number(ratingStats[0].averageRating.toFixed(1))
      : 0;

    const totalReviews = ratingStats.length
      ? ratingStats[0].totalReviews
      : 0;

    await Vehicle.findByIdAndUpdate(
      vehicle._id,
      {
        $set: {
          averageRating,
          totalReviews
        }
      }
    );

    res.status(201).json({
      message: "Vehicle review submitted successfully",
      review: newReview,
      ratingSummary: {
        averageRating,
        totalReviews
      }
    });
  } catch (error) {
    console.error(
      "Create vehicle review error:",
      error.message
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

const getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    if (!mongoose.isValidObjectId(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle ID"
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      "verification.status": "verified"
    }).select("_id averageRating totalReviews");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    const reviews = await VehicleReview.find({
      vehicle: vehicleId
    })
      .populate(
        "renter",
        "name profileImage"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Vehicle reviews fetched successfully",
      ratingSummary: {
        averageRating: vehicle.averageRating,
        totalReviews: vehicle.totalReviews
      },
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error(
      "Get vehicle reviews error:",
      error.message
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  createVehicleReview,
  getVehicleReviews
};