const express = require("express");

const {
  createPayment,
  processDemoPayment,
  getPaymentByBooking,
  getMyPayments,
  processDemoRefund 
} = require("../controllers/PaymentController");

const { protect } = require("../middleware/AuthMiddleware");
const { authorizeRoles } = require("../middleware/RoleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("renter"),
  createPayment
);

router.post(
  "/:id/pay",
  protect,
  authorizeRoles("renter"),
  processDemoPayment
);

router.get(
  "/my-payments",
  protect,
  authorizeRoles("renter"),
  getMyPayments
);

router.get(
  "/booking/:bookingId",
  protect,
  authorizeRoles("renter"),
  getPaymentByBooking
);

router.post(
  "/:id/refund",
  protect,
  authorizeRoles("renter"),
  processDemoRefund
);

module.exports = router;