const express = require("express");

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  addRole,
  getProfile,
  updateProfile
} = require("../controllers/AuthController");

const {
  protect
} = require("../middleware/AuthMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/add-role", protect, addRole);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;