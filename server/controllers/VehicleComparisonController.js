const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

const compareVehicles = async (req, res) => {
  try {
    const { vehicleIds } = req.body;

    if (!Array.isArray(vehicleIds)) {
      return res.status(400).json({
        message: "vehicleIds must be an array"
      });
    }

    if (vehicleIds.length < 2) {
      return res.status(400).json({
        message: "Select at least 2 vehicles to compare"
      });
    }

    if (vehicleIds.length > 5) {
      return res.status(400).json({
        message: "You can compare a maximum of 5 vehicles"
      });
    }

    const uniqueVehicleIds = [
      ...new Set(vehicleIds.map((id) => id.toString()))
    ];

    if (uniqueVehicleIds.length !== vehicleIds.length) {
      return res.status(400).json({
        message: "Duplicate vehicle IDs are not allowed"
      });
    }

    const invalidId = uniqueVehicleIds.find(
      (id) => !mongoose.isValidObjectId(id)
    );

    if (invalidId) {
      return res.status(400).json({
        message: "One or more vehicle IDs are invalid"
      });
    }

    const vehicles = await Vehicle.find({
      _id: { $in: uniqueVehicleIds },
      "verification.status": "verified"
    })
      .select(
        "make model year vehicleType fuelType transmission seatingCapacity mileage rentalPricePerDay location description images driverAvailable driverPricePerDay features averageRating totalReviews"
      )
      .lean();

    if (vehicles.length !== uniqueVehicleIds.length) {
      return res.status(404).json({
        message: "One or more vehicles were not found or are not verified"
      });
    }

    const vehicleMap = new Map(
      vehicles.map((vehicle) => [
        vehicle._id.toString(),
        vehicle
      ])
    );

    const orderedVehicles = uniqueVehicleIds.map(
      (id) => vehicleMap.get(id)
    );

    return res.status(200).json({
      message: "Vehicles compared successfully",
      count: orderedVehicles.length,
      vehicles: orderedVehicles
    });
  } catch (error) {
    console.error(
      "Compare vehicles error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to compare vehicles"
    });
  }
};

module.exports = {
  compareVehicles
};