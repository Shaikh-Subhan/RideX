const express = require("express");

const {
  compareVehicles
} = require("../controllers/VehicleComparisonController");

const { protect } = require("../middleware/AuthMiddleware");
const { authorizeRoles } = require("../middleware/RoleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("renter"),
  compareVehicles
);

module.exports = router;