const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/AuthRoutes");
const vehicleRoutes = require("./routes/VehicleRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const bookingRoutes = require("./routes/BookingRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");
const vehicleReviewRoutes = require("./routes/VehicleReviewRoutes");
const renterTrustRoutes = require("./routes/RenterTrustRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const vehicleComparisonRoutes = require("./routes/VehicleComparisonRoutes");

dotenv.config();

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

connectDB();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000"
  })
);

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "RideX API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vehicle-reviews", vehicleReviewRoutes);
app.use("/api/renter-trust", renterTrustRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/vehicle-comparison", vehicleComparisonRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  res.status(err.status || 500).json({
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`RideX server running on port http://localhost:${PORT}`);
  });
});
