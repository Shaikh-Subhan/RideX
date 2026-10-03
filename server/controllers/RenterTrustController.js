const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const RenterTrustReview = require("../models/RenterTrustReview");
const User = require("../models/User");

const createRenterTrustReview = async (req, res) => {
  try {
    const {
      bookingId,
      score,
      review = ""
    } = req.body;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID"
      });
    }

    const numericScore = Number(score);

    if (
      !Number.isInteger(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      return res.status(400).json({
        message: "Trust score must be an integer between 0 and 100"
      });
    }

    if (typeof review !== "string") {
      return res.status(400).json({
        message: "Review must be text"
      });
    }

    const booking = await Booking.findById(
      bookingId
    ).populate("vehicle");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        message: "Only completed bookings can receive a trust evaluation"
      });
    }

    if (
      !booking.vehicle ||
      booking.vehicle.owner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to evaluate this renter"
      });
    }

    const existingReview =
      await RenterTrustReview.findOne({
        booking: booking._id
      });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already evaluated this renter"
      });
    }

    const renter = await User.findById(
      booking.renter
    );

    if (!renter) {
      return res.status(404).json({
        message: "Renter not found"
      });
    }

    const newReview = await RenterTrustReview.create({
      renter: renter._id,
      owner: req.user._id,
      booking: booking._id,
      score: numericScore,
      review
    });

    const trustStats =
      await RenterTrustReview.aggregate([
        {
          $match: {
            renter: renter._id
          }
        },
        {
          $group: {
            _id: "$renter",
            averageTrustScore: {
              $avg: "$score"
            },
            totalEvaluations: {
              $sum: 1
            }
          }
        }
      ]);

    const trustScore = trustStats.length
      ? Math.round(
          trustStats[0].averageTrustScore
        )
      : 50;

    await User.findByIdAndUpdate(
      renter._id,
      {
        $set: {
          trustScore
        }
      }
    );

    res.status(201).json({
      message: "Renter trust evaluation submitted successfully",
      evaluation: newReview,
      trustSummary: {
        trustScore,
        totalEvaluations: trustStats.length
          ? trustStats[0].totalEvaluations
          : 0
      }
    });
  } catch (error) {
    console.error(
      "Create renter trust review error:",
      error.message
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

const getRenterTrustReviews = async (req, res) => {
  try {
    const { renterId } = req.params;

    if (!mongoose.isValidObjectId(renterId)) {
      return res.status(400).json({
        message: "Invalid renter ID"
      });
    }

    const renter = await User.findById(
      renterId
    ).select("_id name profileImage trustScore");

    if (!renter) {
      return res.status(404).json({
        message: "Renter not found"
      });
    }

    const evaluations =
      await RenterTrustReview.find({
        renter: renterId
      })
        .populate(
          "owner",
          "name profileImage"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Renter trust evaluations fetched successfully",
      trustSummary: {
        trustScore: renter.trustScore,
        totalEvaluations: evaluations.length
      },
      count: evaluations.length,
      evaluations
    });
  } catch (error) {
    console.error(
      "Get renter trust reviews error:",
      error.message
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  createRenterTrustReview,
  getRenterTrustReviews
};