const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const {createNotification} = require("./NotificationController");

const getPagination = (page, limit) => {
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

const reviewVehicleVerification = async (req, res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be verified or rejected",
      });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.verification.status !== "pending") {
      return res.status(400).json({
        message: "Only pending vehicles can be reviewed",
      });
    }

    if (
      !vehicle.verification.registrationDocument?.publicId ||
      !vehicle.verification.insuranceDocument?.publicId
    ) {
      return res.status(400).json({
        message: "Both registration and insurance documents are required",
      });
    }

    vehicle.verification.status = status;
    vehicle.verification.verifiedAt = status === "verified" ? new Date() : null;

    await vehicle.save();

    return res.status(200).json({
      message: `Vehicle ${status} successfully`,
      vehicle: {
        _id: vehicle._id,
        verification: {
          status: vehicle.verification.status,
          verifiedAt: vehicle.verification.verifiedAt,
        },
      },
    });
  } catch (error) {
    console.error("Review vehicle verification error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPendingVerifications = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      "verification.status": "pending",
      "verification.registrationDocument.publicId": {
        $exists: true,
        $ne: "",
      },
      "verification.insuranceDocument.publicId": {
        $exists: true,
        $ne: "",
      },
    })
      .select(
        "owner make model year vehicleType rentalPricePerDay location images driverAvailable averageRating totalReviews verification.status verification.registrationDocument.originalName verification.insuranceDocument.originalName verification.verifiedAt createdAt updatedAt",
      )
      .populate("owner", "name email phone profileImage isVerified")
      .sort({updatedAt: -1});

    return res.status(200).json({
      message: "Pending vehicle verifications fetched successfully",
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get pending verifications error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalRenters,
      totalOwners,
      totalAdmins,
      totalVehicles,
      verifiedVehicles,
      pendingVehicles,
      rejectedVehicles,
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      cancelledBookings,
      completedBookings,
      totalPayments,
      createdPayments,
      partialPayments,
      paidPayments,
      failedPayments,
      refundedPayments,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        roles: "renter",
      }),

      User.countDocuments({
        roles: "owner",
      }),

      User.countDocuments({
        roles: "admin",
      }),

      Vehicle.countDocuments(),

      Vehicle.countDocuments({
        "verification.status": "verified",
      }),

      Vehicle.countDocuments({
        "verification.status": "pending",
      }),

      Vehicle.countDocuments({
        "verification.status": "rejected",
      }),

      Booking.countDocuments(),

      Booking.countDocuments({
        status: "pending",
      }),

      Booking.countDocuments({
        status: "approved",
      }),

      Booking.countDocuments({
        status: "rejected",
      }),

      Booking.countDocuments({
        status: "cancelled",
      }),

      Booking.countDocuments({
        status: "completed",
      }),

      Payment.countDocuments(),

      Payment.countDocuments({
        status: "created",
      }),

      Payment.countDocuments({
        status: "partially_paid",
      }),

      Payment.countDocuments({
        status: "paid",
      }),

      Payment.countDocuments({
        status: "failed",
      }),

      Payment.countDocuments({
        status: "refunded",
      }),
    ]);

    const collectedResult = await Payment.aggregate([
      {
        $match: {
          status: {
            $in: ["partially_paid", "paid"],
          },
        },
      },
      {
        $group: {
          _id: null,
          amount: {
            $sum: "$paidAmount",
          },
        },
      },
    ]);

    const refundedResult = await Payment.aggregate([
      {
        $match: {
          status: "refunded",
        },
      },
      {
        $group: {
          _id: null,
          amount: {
            $sum: "$paidAmount",
          },
        },
      },
    ]);

    const totalCollectedAmount =
      collectedResult.length > 0 ? collectedResult[0].amount : 0;

    const totalRefundedAmount =
      refundedResult.length > 0 ? refundedResult[0].amount : 0;

    return res.status(200).json({
      message: "Admin dashboard statistics fetched successfully",

      users: {
        total: totalUsers,
        renters: totalRenters,
        owners: totalOwners,
        admins: totalAdmins,
      },

      vehicles: {
        total: totalVehicles,
        verified: verifiedVehicles,
        pending: pendingVehicles,
        rejected: rejectedVehicles,
      },

      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        rejected: rejectedBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
      },

      payments: {
        total: totalPayments,
        created: createdPayments,
        partiallyPaid: partialPayments,
        paid: paidPayments,
        failed: failedPayments,
        refunded: refundedPayments,
        totalCollectedAmount,
        totalRefundedAmount,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const {role, search, page, limit} = req.query;

    const validRoles = ["renter", "owner", "admin"];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPagination(page, limit);

    const query = {};

    if (role) {
      query.roles = role;
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "name email phone roles profileImage isVerified createdAt updatedAt",
        )
        .sort({createdAt: -1})
        .skip(skip)
        .limit(currentLimit),

      User.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Users fetched successfully",
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
      filters: {
        role: role || "all",
        search: search || "",
      },
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllVehiclesAdmin = async (req, res) => {
  try {
    const {status, search, page, limit} = req.query;

    const validStatuses = ["pending", "verified", "rejected"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid verification status",
      });
    }

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPagination(page, limit);

    const query = {};

    if (status) {
      query["verification.status"] = status;
    }

    if (search) {
      query.$or = [
        {
          make: {
            $regex: search,
            $options: "i",
          },
        },
        {
          model: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .select(
          "owner make model year vehicleType fuelType transmission seatingCapacity rentalPricePerDay location images driverAvailable averageRating totalReviews verification.status verification.registrationDocument.originalName verification.insuranceDocument.originalName verification.verifiedAt createdAt updatedAt",
        )
        .populate("owner", "name email phone profileImage isVerified")
        .sort({createdAt: -1})
        .skip(skip)
        .limit(currentLimit),

      Vehicle.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Vehicles fetched successfully",
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
      filters: {
        status: status || "all",
        search: search || "",
      },
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get all admin vehicles error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllBookingsAdmin = async (req, res) => {
  try {
    const {status, paymentStatus, page, limit} = req.query;

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

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPagination(page, limit);

    const query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate(
          "vehicle",
          "make model year location rentalPricePerDay averageRating",
        )
        .populate("renter", "name email phone profileImage trustScore")
        .sort({createdAt: -1})
        .skip(skip)
        .limit(currentLimit),

      Booking.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "All bookings fetched successfully",
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
      filters: {
        status: status || "all",
        paymentStatus: paymentStatus || "all",
      },
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all admin bookings error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllPaymentsAdmin = async (req, res) => {
  try {
    const {status, page, limit} = req.query;

    const validStatuses = [
      "created",
      "partially_paid",
      "paid",
      "failed",
      "refunded",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPagination(page, limit);

    const query = {};

    if (status) {
      query.status = status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate(
          "booking",
          "startDate endDate status paymentStatus totalAmount",
        )
        .populate("renter", "name email phone profileImage trustScore")
        .sort({createdAt: -1})
        .skip(skip)
        .limit(currentLimit),

      Payment.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "All payments fetched successfully",
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
      filters: {
        status: status || "all",
      },
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get all admin payments error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getVehicleVerificationDocument = async (req, res) => {
  try {
    const {id, document} = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const allowedDocuments = ["registrationDocument", "insuranceDocument"];

    if (!allowedDocuments.includes(document)) {
      return res.status(400).json({
        message: "Invalid verification document",
      });
    }

    const vehicle = await Vehicle.findById(id).select(
      `verification.${document}`,
    );

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    const documentData = vehicle.verification?.[document];

    if (!documentData?.publicId) {
      return res.status(404).json({
        message: "Verification document not found",
      });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 300;

    const url = cloudinary.utils.private_download_url(
      documentData.publicId,
      "pdf",
      {
        resource_type: documentData.resourceType || "raw",
        type: documentData.type || "authenticated",
        expires_at: expiresAt,
      },
    );

    return res.status(200).json({
      message: "Verification document URL generated",
      url,
      expiresAt,
    });
  } catch (error) {
    console.error("Get verification document error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  reviewVehicleVerification,
  getPendingVerifications,
  getDashboardStats,
  getAllUsers,
  getAllVehiclesAdmin,
  getAllBookingsAdmin,
  getAllPaymentsAdmin,
  getVehicleVerificationDocument,
};
