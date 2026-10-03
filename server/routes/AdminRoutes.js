const express = require("express");

const {
  reviewVehicleVerification,
  getPendingVerifications,
  getDashboardStats,
  getAllUsers,
  getAllVehiclesAdmin,
  getAllBookingsAdmin,
  getAllPaymentsAdmin
} = require("../controllers/AdminController");

const { protect } = require("../middleware/AuthMiddleware");
const { authorizeRoles } = require("../middleware/RoleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.get(
  "/vehicles",
  protect,
  authorizeRoles("admin"),
  getAllVehiclesAdmin
);

router.get(
  "/bookings",
  protect,
  authorizeRoles("admin"),
  getAllBookingsAdmin
);

router.get(
  "/payments",
  protect,
  authorizeRoles("admin"),
  getAllPaymentsAdmin
);

router.get(
  "/vehicles/pending-verifications",
  protect,
  authorizeRoles("admin"),
  getPendingVerifications
);

router.put(
  "/vehicles/:id/verification",
  protect,
  authorizeRoles("admin"),
  reviewVehicleVerification
);

module.exports = router;