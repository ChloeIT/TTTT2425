const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { validateData } = require("../middlewares/validationMiddleware");
const requireLogin = require("../middlewares/authMiddleware");
const authSchema = require("../schemas/auth.schema");
const permitRoles = require("../middlewares/roleMiddleware");
const { Role } = require("../generated/prisma");
const authRoute = Router();

authRoute.post(
  "/login",
  validateData(authSchema.loginSchema),
  authController.login
);
authRoute.post(
  "/register",
  // requireLogin,
  // permitRoles(Role.BAN_GIAM_HIEU),
  validateData(authSchema.registerSchema),
  authController.register
);

authRoute.get("/currentUser", requireLogin, authController.currentUser);
authRoute.get("/logout", requireLogin, authController.logout);

authRoute.post(
  "/forgotPassword/createOtp",
  validateData(authSchema.getForgotPasswordOtpSchema),
  authController.createForgotPasswordOtp
);
authRoute.get(
  "/forGotPassword/verifyToken",
  authController.verifyForgotPasswordToken
);

authRoute.post(
  "/forGotPassword/verifyOtp",
  validateData(authSchema.verifyForgotPasswordSchema),
  authController.resetForgotPassword
);

module.exports = authRoute;
