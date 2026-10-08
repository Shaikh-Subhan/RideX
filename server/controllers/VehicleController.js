const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const {createNotification} = require("./NotificationController");

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ridex/vehicles",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(file.buffer);
  });
};

const uploadPdfToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        type: "authenticated",
        format: "pdf",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(file.buffer);
  });
};

const deleteCloudinaryFile = async (
  publicId,
  resourceType = "image",
  type = "upload",
) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

const addVehicle = async (req, res) => {
  const uploadedImages = [];

  try {
    const {
      vehicleNumber,
      make,
      model,
      year,
      vehicleType,
      fuelType,
      transmission,
      seatingCapacity,
      mileage,
      rentalPricePerDay,
      location,
      description,
      driverAvailable,
      driverPricePerDay,
      features,
    } = req.body;

    if (
      !vehicleNumber ||
      !make ||
      !model ||
      !year ||
      !vehicleType ||
      !fuelType ||
      !transmission ||
      !seatingCapacity ||
      mileage === undefined ||
      rentalPricePerDay === undefined ||
      !location
    ) {
      return res.status(400).json({
        message: "Required vehicle fields are missing",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one vehicle image is required",
      });
    }

    for (const file of req.files) {
      const result = await uploadImageToCloudinary(file);

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    const parsedFeatures =
      typeof features === "string" ?
        features
          .split(",")
          .map((feature) => feature.trim())
          .filter(Boolean)
      : Array.isArray(features) ? features
      : [];

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      vehicleNumber,
      make,
      model,
      year,
      vehicleType,
      fuelType,
      transmission,
      seatingCapacity,
      mileage,
      rentalPricePerDay,
      location,
      description,
      images: uploadedImages,
      driverAvailable: driverAvailable === true || driverAvailable === "true",
      driverPricePerDay: Number(driverPricePerDay) || 0,
      features: parsedFeatures,
    });

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    for (const image of uploadedImages) {
      await deleteCloudinaryFile(image.publicId);
    }

    console.error("Add vehicle error:", error.message);

    res.status(500).json({
      message: "Failed to add vehicle",
    });
  }
};

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      owner: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Vehicles fetched successfully",
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get my vehicles error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getVehicleById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      "verification.status": "verified",
    })
      .select(
        "-verification.registrationDocument -verification.insuranceDocument",
      )
      .populate("owner", "name profileImage trustScore isVerified");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      message: "Vehicle fetched successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Get vehicle error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateVehicle = async (req, res) => {
  const newlyUploadedImages = [];

  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own vehicle",
      });
    }

    const {
      vehicleNumber,
      make,
      model,
      year,
      vehicleType,
      fuelType,
      transmission,
      seatingCapacity,
      mileage,
      rentalPricePerDay,
      location,
      description,
      driverAvailable,
      driverPricePerDay,
      features,
    } = req.body;

    if (vehicleNumber !== undefined) {
      vehicle.vehicleNumber = vehicleNumber;
    }

    if (make !== undefined) {
      vehicle.make = make;
    }

    if (model !== undefined) {
      vehicle.model = model;
    }

    if (year !== undefined) {
      vehicle.year = year;
    }

    if (vehicleType !== undefined) {
      vehicle.vehicleType = vehicleType;
    }

    if (fuelType !== undefined) {
      vehicle.fuelType = fuelType;
    }

    if (transmission !== undefined) {
      vehicle.transmission = transmission;
    }

    if (seatingCapacity !== undefined) {
      vehicle.seatingCapacity = seatingCapacity;
    }

    if (mileage !== undefined) {
      vehicle.mileage = mileage;
    }

    if (rentalPricePerDay !== undefined) {
      vehicle.rentalPricePerDay = rentalPricePerDay;
    }

    if (location !== undefined) {
      vehicle.location = location;
    }

    if (description !== undefined) {
      vehicle.description = description;
    }

    if (driverAvailable !== undefined) {
      vehicle.driverAvailable =
        driverAvailable === true || driverAvailable === "true";
    }

    if (driverPricePerDay !== undefined) {
      vehicle.driverPricePerDay = Number(driverPricePerDay) || 0;
    }

    if (features !== undefined) {
      vehicle.features =
        typeof features === "string" ?
          features
            .split(",")
            .map((feature) => feature.trim())
            .filter(Boolean)
        : Array.isArray(features) ? features
        : [];
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadImageToCloudinary(file);

        const image = {
          url: result.secure_url,
          publicId: result.public_id,
        };

        newlyUploadedImages.push(image);
      }

      vehicle.images.push(...newlyUploadedImages);
    }

    const updatedVehicle = await vehicle.save();

    res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    for (const image of newlyUploadedImages) {
      await deleteCloudinaryFile(image.publicId);
    }

    console.error("Update vehicle error:", error.message);

    res.status(500).json({
      message: "Failed to update vehicle",
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own vehicle",
      });
    }

    for (const image of vehicle.images) {
      await deleteCloudinaryFile(image.publicId);
    }

    if (vehicle.verification.registrationDocument.publicId) {
      await deleteCloudinaryFile(
        vehicle.verification.registrationDocument.publicId,
        "raw",
        "authenticated",
      );
    }

    if (vehicle.verification.insuranceDocument.publicId) {
      await deleteCloudinaryFile(
        vehicle.verification.insuranceDocument.publicId,
        "raw",
        "authenticated",
      );
    }

    await vehicle.deleteOne();

    res.status(200).json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateVehicleAvailability = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own vehicle",
      });
    }

    const {availability} = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        message: "Availability must be an array",
      });
    }

    const ranges = availability.map((range) => ({
      startDate: new Date(range.startDate),
      endDate: new Date(range.endDate),
    }));

    for (const range of ranges) {
      if (
        Number.isNaN(range.startDate.getTime()) ||
        Number.isNaN(range.endDate.getTime()) ||
        range.startDate >= range.endDate
      ) {
        return res.status(400).json({
          message:
            "Each availability range must have valid start and end dates",
        });
      }
    }

    ranges.sort((a, b) => a.startDate - b.startDate);

    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i].startDate < ranges[i - 1].endDate) {
        return res.status(400).json({
          message: "Availability ranges cannot overlap",
        });
      }
    }

    vehicle.availability = ranges;

    await vehicle.save();

    res.status(200).json({
      message: "Vehicle availability updated successfully",
      availability: vehicle.availability,
    });
  } catch (error) {
    console.error("Update availability error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const submitVehicleVerification = async (req, res) => {
  const uploadedDocuments = [];

  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only submit verification for your own vehicle",
      });
    }

    if (vehicle.verification.status === "verified") {
      return res.status(400).json({
        message: "This vehicle is already verified",
      });
    }

    const registrationFile = req.files?.registrationDocument?.[0];

    const insuranceFile = req.files?.insuranceDocument?.[0];

    if (!registrationFile || !insuranceFile) {
      return res.status(400).json({
        message: "Registration and insurance documents are required",
      });
    }

    const registrationResult = await uploadPdfToCloudinary(
      registrationFile,
      "ridex/verification",
    );

    uploadedDocuments.push({
      publicId: registrationResult.public_id,
      resourceType: "raw",
      type: "authenticated",
    });

    const insuranceResult = await uploadPdfToCloudinary(
      insuranceFile,
      "ridex/verification",
    );

    uploadedDocuments.push({
      publicId: insuranceResult.public_id,
      resourceType: "raw",
      type: "authenticated",
    });

    if (vehicle.verification.registrationDocument.publicId) {
      await deleteCloudinaryFile(
        vehicle.verification.registrationDocument.publicId,
        "raw",
        "authenticated",
      );
    }

    if (vehicle.verification.insuranceDocument.publicId) {
      await deleteCloudinaryFile(
        vehicle.verification.insuranceDocument.publicId,
        "raw",
        "authenticated",
      );
    }

    vehicle.verification.registrationDocument = {
      publicId: registrationResult.public_id,
      resourceType: "raw",
      type: "authenticated",
      originalName: registrationFile.originalname,
    };

    vehicle.verification.insuranceDocument = {
      publicId: insuranceResult.public_id,
      resourceType: "raw",
      type: "authenticated",
      originalName: insuranceFile.originalname,
    };

    vehicle.verification.status = "pending";
    vehicle.verification.verifiedAt = null;

    await vehicle.save();

    const admins = await User.find({
      roles: "admin",
    }).select("_id");

    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: "vehicle_verification_requested",
        title: "New Vehicle Verification Request",
        message: `A new vehicle verification request has been submitted for ${vehicle.make} ${vehicle.model}.`,
        relatedVehicle: vehicle._id,
      });
    }

    res.status(200).json({
      message: "Vehicle verification submitted successfully",
      verification: {
        status: vehicle.verification.status,
        registrationDocument:
          vehicle.verification.registrationDocument.originalName,
        insuranceDocument: vehicle.verification.insuranceDocument.originalName,
      },
    });
  } catch (error) {
    for (const document of uploadedDocuments) {
      await deleteCloudinaryFile(
        document.publicId,
        document.resourceType,
        document.type,
      );
    }

    console.error("Vehicle verification error:", error.message);

    res.status(500).json({
      message: "Failed to submit vehicle verification",
    });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const {
      keyword,
      location,
      vehicleType,
      fuelType,
      transmission,
      minSeats,
      minPrice,
      maxPrice,
      minRating,
      driverAvailable,
      startDate,
      endDate,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      "verification.status": "verified",
    };

    if (keyword) {
      const keywordRegex = new RegExp(keyword.trim(), "i");

      query.$or = [{make: keywordRegex}, {model: keywordRegex}];
    }

    if (location) {
      query.location = new RegExp(location.trim(), "i");
    }

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (minSeats !== undefined) {
      const seats = Number(minSeats);

      if (Number.isNaN(seats) || seats < 1) {
        return res.status(400).json({
          message: "Invalid minimum seats",
        });
      }

      query.seatingCapacity = {
        $gte: seats,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.rentalPricePerDay = {};

      if (minPrice !== undefined) {
        const price = Number(minPrice);

        if (Number.isNaN(price) || price < 0) {
          return res.status(400).json({
            message: "Invalid minimum price",
          });
        }

        query.rentalPricePerDay.$gte = price;
      }

      if (maxPrice !== undefined) {
        const price = Number(maxPrice);

        if (Number.isNaN(price) || price < 0) {
          return res.status(400).json({
            message: "Invalid maximum price",
          });
        }

        query.rentalPricePerDay.$lte = price;
      }

      if (
        query.rentalPricePerDay.$gte !== undefined &&
        query.rentalPricePerDay.$lte !== undefined &&
        query.rentalPricePerDay.$gte > query.rentalPricePerDay.$lte
      ) {
        return res.status(400).json({
          message: "Minimum price cannot be greater than maximum price",
        });
      }
    }

    if (minRating !== undefined) {
      const rating = Number(minRating);

      if (Number.isNaN(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({
          message: "Minimum rating must be between 0 and 5",
        });
      }

      query.averageRating = {
        $gte: rating,
      };
    }

    if (driverAvailable !== undefined) {
      if (driverAvailable !== "true" && driverAvailable !== "false") {
        return res.status(400).json({
          message: "driverAvailable must be true or false",
        });
      }

      query.driverAvailable = driverAvailable === "true";
    }

    let requestedStart = null;
    let requestedEnd = null;

    if (startDate || endDate) {
      if (!startDate || !endDate) {
        return res.status(400).json({
          message: "Both startDate and endDate are required",
        });
      }

      requestedStart = new Date(startDate);
      requestedEnd = new Date(endDate);

      if (
        Number.isNaN(requestedStart.getTime()) ||
        Number.isNaN(requestedEnd.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid date format",
        });
      }

      if (requestedStart >= requestedEnd) {
        return res.status(400).json({
          message: "startDate must be before endDate",
        });
      }

      if (requestedStart < new Date()) {
        return res.status(400).json({
          message: "startDate cannot be in the past",
        });
      }

      query.availability = {
        $elemMatch: {
          startDate: {
            $lte: requestedStart,
          },
          endDate: {
            $gte: requestedEnd,
          },
        },
      };

      const conflictingBookings = await Booking.find({
        status: {
          $in: ["pending", "approved"],
        },
        startDate: {
          $lt: requestedEnd,
        },
        endDate: {
          $gt: requestedStart,
        },
      }).select("vehicle");

      const unavailableVehicleIds = conflictingBookings.map(
        (booking) => booking.vehicle,
      );

      if (unavailableVehicleIds.length > 0) {
        query._id = {
          $nin: unavailableVehicleIds,
        };
      }
    }

    const validSorts = ["newest", "oldest", "priceLow", "priceHigh", "rating"];

    if (!validSorts.includes(sort)) {
      return res.status(400).json({
        message:
          "Invalid sort. Use newest, oldest, priceLow, priceHigh or rating",
      });
    }

    let sortQuery = {
      _id: 1,
    };

    if (sort === "newest") {
      sortQuery = {
        createdAt: -1,
        _id: 1,
      };
    }

    if (sort === "oldest") {
      sortQuery = {
        createdAt: 1,
        _id: 1,
      };
    }

    if (sort === "priceLow") {
      sortQuery = {
        rentalPricePerDay: 1,
        _id: 1,
      };
    }

    if (sort === "priceHigh") {
      sortQuery = {
        rentalPricePerDay: -1,
        _id: 1,
      };
    }

    if (sort === "rating") {
      sortQuery = {
        averageRating: -1,
        _id: 1,
      };
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        message: "Page must be a positive integer",
      });
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 50) {
      return res.status(400).json({
        message: "Limit must be between 1 and 50",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;

    const totalVehicles = await Vehicle.countDocuments(query);

    const vehicles = await Vehicle.find(query)
      .select(
        "make model year vehicleType fuelType transmission seatingCapacity mileage rentalPricePerDay location description images driverAvailable driverPricePerDay features averageRating totalReviews owner",
      )
      .populate("owner", "name profileImage isVerified")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalVehicles / limitNumber);

    return res.status(200).json({
      message: "Vehicles fetched successfully",
      filters: {
        keyword: keyword || null,
        location: location || null,
        vehicleType: vehicleType || null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        minSeats: minSeats !== undefined ? Number(minSeats) : null,
        minPrice: minPrice !== undefined ? Number(minPrice) : null,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : null,
        minRating: minRating !== undefined ? Number(minRating) : null,
        driverAvailable:
          driverAvailable !== undefined ? driverAvailable === "true" : null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalVehicles,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
      sort,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get all vehicles error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch vehicles",
    });
  }
};

module.exports = {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateVehicleAvailability,
  submitVehicleVerification,
  getAllVehicles,
};
