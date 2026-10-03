const express = require("express");

const {
  createRenterTrustReview,
  getRenterTrustReviews
} = require("../controllers/RenterTrustController");

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
  authorizeRoles("owner"),
  createRenterTrustReview
);

router.get(
  "/renter/:renterId",
  protect,
  authorizeRoles("owner"),
  getRenterTrustReviews
);

module.exports = router;