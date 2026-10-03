const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;
const INACTIVITY_LIMIT_DAYS = 3;

const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_ACCESS_EXPIRES_IN || ACCESS_TOKEN_EXPIRES_IN
    }
  );
};

const createRefreshToken = async (user) => {
  const token = crypto.randomBytes(64).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt
  });

  return token;
};

const getSafeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roles: user.roles,
    trustScore: user.trustScore,
    isVerified: user.isVerified,
    lastActiveAt: user.lastActiveAt
  };
};

const isInactive = (lastActiveAt) => {
  if (!lastActiveAt) {
    return false;
  }

  const inactivityLimit =
    INACTIVITY_LIMIT_DAYS * 24 * 60 * 60 * 1000;

  return Date.now() - new Date(lastActiveAt).getTime() >
    inactivityLimit;
};

const registerUser = async (req, res) => {
  try {
    const {name, email, phone, password, role} = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        message: "Name, email, phone, password and role are required"
      });
    }

    if (!["renter", "owner"].includes(role)) {
      return res.status(400).json({
        message: "Role must be renter or owner"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      roles: [role],
      lastActiveAt: new Date()
    });

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || ACCESS_TOKEN_EXPIRES_IN,
      user: getSafeUser(user)
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Internal Server error"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    user.lastActiveAt = new Date();
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || ACCESS_TOKEN_EXPIRES_IN,
      user: getSafeUser(user)
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required"
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await RefreshToken.findOne({
      tokenHash,
      revokedAt: null
    });

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid or revoked refresh token"
      });
    }

    if (storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Refresh token expired"
      });
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
      await RefreshToken.findByIdAndUpdate(
        storedToken._id,
        {
          revokedAt: new Date()
        }
      );

      return res.status(401).json({
        message: "User no longer exists"
      });
    }

    if (isInactive(user.lastActiveAt)) {
      await RefreshToken.findByIdAndUpdate(
        storedToken._id,
        {
          revokedAt: new Date()
        }
      );

      return res.status(401).json({
        message: "Session expired due to 3 days of inactivity"
      });
    }

    user.lastActiveAt = new Date();
    await user.save();

    const accessToken = createAccessToken(user);

    res.status(200).json({
      message: "Access token refreshed",
      accessToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || ACCESS_TOKEN_EXPIRES_IN,
      user: getSafeUser(user)
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required"
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await RefreshToken.findOneAndUpdate(
      {
        tokenHash,
        revokedAt: null
      },
      {
        revokedAt: new Date()
      }
    );

    res.status(200).json({
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const addRole = async (req, res) => {
  try {
    const {role} = req.body;

    if (!role) {
      return res.status(400).json({
        message: "Role is required"
      });
    }

    if (!["renter", "owner"].includes(role)) {
      return res.status(400).json({
        message: "Role must be renter or owner"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.roles.includes(role)) {
      return res.status(409).json({
        message: `User already has ${role} role`
      });
    }

    user.roles.push(role);
    user.lastActiveAt = new Date();

    await user.save();

    res.status(200).json({
      message: `${role} role added successfully`,
      user: getSafeUser(user)
    });
  } catch (error) {
    console.error("Add role error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      user: getSafeUser(req.user)
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {name, phone, profileImage} = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    user.lastActiveAt = new Date();

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: getSafeUser(updatedUser)
    });
  } catch (error) {
    console.error("Profile update error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  addRole,
  getProfile,
  updateProfile
};