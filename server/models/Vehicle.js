const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    make: {
      type: String,
      required: true,
      trim: true
    },

    model: {
      type: String,
      required: true,
      trim: true
    },

    year: {
      type: Number,
      required: true
    },

    vehicleType: {
      type: String,
      required: true,
      enum: [
        "hatchback",
        "sedan",
        "suv",
        "muv",
        "luxury",
        "sports"
      ]
    },

    fuelType: {
      type: String,
      required: true,
      enum: [
        "petrol",
        "diesel",
        "cng",
        "electric",
        "hybrid"
      ]
    },

    transmission: {
      type: String,
      required: true,
      enum: [
        "manual",
        "automatic"
      ]
    },

    seatingCapacity: {
      type: Number,
      required: true,
      min: 1
    },

    mileage: {
      type: Number,
      required: true
    },

    rentalPricePerDay: {
      type: Number,
      required: true,
      min: 0
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    images: {
      type: [String],
      default: []
    },

    driverAvailable: {
      type: Boolean,
      default: false
    },

    driverPricePerDay: {
      type: Number,
      default: 0,
      min: 0
    },

    features: {
      type: [String],
      default: []
    },

    availability: [
      {
        startDate: {
          type: Date,
          required: true
        },

        endDate: {
          type: Date,
          required: true
        }
      }
    ],

    verification: {
      status: {
        type: String,
        enum: [
          "pending",
          "verified",
          "rejected"
        ],
        default: "pending"
      },

      registrationDocument: {
        type: String,
        default: ""
      },

      insuranceDocument: {
        type: String,
        default: ""
      },

      verifiedAt: {
        type: Date,
        default: null
      }
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    totalReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

vehicleSchema.index({
  owner: 1,
  createdAt: -1
});

vehicleSchema.index({
  "verification.status": 1,
  createdAt: -1
});

vehicleSchema.index({
  vehicleType: 1,
  fuelType: 1,
  transmission: 1
});

vehicleSchema.index({
  location: 1
});

module.exports = mongoose.model("Vehicle", vehicleSchema);