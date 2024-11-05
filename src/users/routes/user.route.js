const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Get Profile
router.get(
  "/",
  authenticateToken,
  UserController.getProfile.bind(UserController)
);

// Get Notifications
router.get(
  "/notifications",
  authenticateToken,
  UserController.getUserNotifications.bind(UserController)
);

// Modify Allowed Notifications
router.patch(
  '/notifications',
  authenticateToken,
  UserController.modifyAllowedNotification.bind(UserController)
)

// Update Profile
router.patch(
  "/",
  authenticateToken,
  UserController.updateProfile.bind(UserController)
);

// Delete User
router.delete(
  "/",
  authenticateToken,
  UserController.deleteUser.bind(UserController)
);

// Send Contact Us
router.post(
  "/send-contact-us",
  authenticateToken,
  UserController.sendContactUs.bind(UserController)
);

module.exports = router;
