const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedBooking = null,
  relatedVehicle = null
}) => {
  try {
    return await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedBooking,
      relatedVehicle
    });
  } catch (error) {
    console.error(
      "Create notification error:",
      error.message
    );

    return null;
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
      .populate(
        "relatedBooking",
        "startDate endDate status paymentStatus totalAmount"
      )
      .populate(
        "relatedVehicle",
        "make model year images location"
      )
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to fetch notifications"
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid notification ID"
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to update notification"
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true
        }
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to update notifications"
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};