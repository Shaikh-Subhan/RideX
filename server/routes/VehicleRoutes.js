const express = require("express");

const {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateVehicleAvailability,
  submitVehicleVerification,
  getAllVehicles,
} = require("../controllers/VehicleController");

const {protect} = require("../middleware/AuthMiddleware");

const {authorizeRoles} = require("../middleware/RoleMiddleware");

const {
  uploadVehicleImages,
  uploadVerificationDocuments,
} = require("../middleware/UploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("owner"),
  uploadVehicleImages,
  addVehicle,
);

router.get("/", getAllVehicles);

router.get("/my-vehicles", protect, authorizeRoles("owner"), getMyVehicles);

router.get("/:id", getVehicleById);

router.put(
  "/:id",
  protect,
  authorizeRoles("owner"),
  uploadVehicleImages,
  updateVehicle,
);

router.put(
  "/:id/availability",
  protect,
  authorizeRoles("owner"),
  updateVehicleAvailability,
);

router.put(
  "/:id/verification",
  protect,
  authorizeRoles("owner"),
  uploadVerificationDocuments,
  submitVehicleVerification,
);

router.delete("/:id", protect, authorizeRoles("owner"), deleteVehicle);

module.exports = router;
