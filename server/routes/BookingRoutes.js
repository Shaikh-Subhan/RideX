const express = require("express");

const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  reviewBooking,
  cancelBooking,
  completeBooking,
  getBookingById,
  getOwnerEarnings
} = require("../controllers/BookingController");

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
  createBooking
);

router.get(
  "/my-bookings",
  protect,
  authorizeRoles("renter"),
  getMyBookings
);

router.get(
  "/owner-bookings",
  protect,
  authorizeRoles("owner"),
  getOwnerBookings
);

router.put(
  "/:id/review",
  protect,
  authorizeRoles("owner"),
  reviewBooking
);

router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("renter"),
  cancelBooking
);

router.get(
  "/owner-earnings",
  protect,
  authorizeRoles("owner"),
  getOwnerEarnings
);


router.put(
  "/:id/complete",
  protect,
  authorizeRoles("owner"),
  completeBooking
);

router.get(
  "/:id",
  protect,
  authorizeRoles("renter", "owner"),
  getBookingById
);

module.exports = router;