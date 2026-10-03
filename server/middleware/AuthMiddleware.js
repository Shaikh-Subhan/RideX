const jwt = require("jsonwebtoken");
const User = require("../models/User");

const INACTIVITY_LIMIT_DAYS = 3;
const ACTIVITY_UPDATE_INTERVAL_MINUTES = 10;

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid authentication token"
      });
    }

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists"
      });
    }

    if (user.lastActiveAt) {
      const inactivityLimit =
        INACTIVITY_LIMIT_DAYS *
        24 *
        60 *
        60 *
        1000;

      const inactiveFor =
        Date.now() -
        new Date(user.lastActiveAt).getTime();

      if (inactiveFor > inactivityLimit) {
        return res.status(401).json({
          message: "Session expired due to 3 days of inactivity"
        });
      }
    }

    if (
      !user.lastActiveAt ||
      Date.now() -
        new Date(user.lastActiveAt).getTime() >
        ACTIVITY_UPDATE_INTERVAL_MINUTES *
          60 *
          1000
    ) {
      user.lastActiveAt = new Date();
      await user.save();
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token"
      });
    }

    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(500).json({
      message: "Authentication failed"
    });
  }
};

module.exports = {
  protect
};