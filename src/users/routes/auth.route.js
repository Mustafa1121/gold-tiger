const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Login
router.post(
  "/login",
  AuthController.login.bind(AuthController)
);

// Register
router.post(
  "/register",
  AuthController.register.bind(AuthController)
);

// Forgot Password
router.post(
  "/forget-password",
  AuthController.forgetPassword.bind(AuthController)
);

// Reset Password
router.post(
  "/reset-password",
  AuthController.resetPassword.bind(AuthController)
);

// Change Password
router.post(
  "/change-password",
  authenticateToken,
  AuthController.changePassword.bind(AuthController)
);

module.exports = router;
