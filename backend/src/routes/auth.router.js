const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const validateData = require("../middlewares/validationMiddleware");
const userSchema = require("../schemas/user.schema");
const requireLogin = require("../middlewares/authMiddleware");
const authRoute = Router();

authRoute.post(
  "/login",
  validateData(userSchema.loginSchema),
  authController.login
);
authRoute.post(
  "/register",
  validateData(userSchema.registerSchema),
  authController.register
);

authRoute.get("/currentUser", requireLogin, authController.currentUser);
authRoute.get("/logout", requireLogin, authController.logout);
module.exports = authRoute;
