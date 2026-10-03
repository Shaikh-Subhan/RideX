const express = require("express");

const {
  createVehicleReview,
  getVehicleReviews
} = require("../controllers/VehicleReviewController");

const {
  protect
} = require("../middleware/AuthMiddleware");

const {
  authorizeRoles
} = require("../middleware/RoleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("renter"),
  createVehicleReview
);

router.get(
  "/vehicle/:vehicleId",
  getVehicleReviews
);

module.exports = router;