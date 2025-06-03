const { Router } = require("express");
const { validateData } = require("../middlewares/validationMiddleware");
const userSchema = require("../schemas/user.schema");
const requireLogin = require("../middlewares/authMiddleware");
const userController = require("../controllers/user.controller");
const permitRoles = require("../middlewares/roleMiddleware");
const { Role } = require("../generated/prisma");
const userRoute = Router();

userRoute.get(
  "/",
  requireLogin,
  permitRoles(Role.BAN_GIAM_HIEU),
  userController.getUsersPagination
);

userRoute.patch(
  "/editProfile",
  requireLogin,
  validateData(userSchema.editProfileSchema),
  userController.editProfile
);
userRoute.patch(
  "/:id/edit",
  requireLogin,
  permitRoles(Role.BAN_GIAM_HIEU),
  validateData(userSchema.editUserSchema),
  userController.editUser
);

userRoute.patch(
  "/resetPassword",
  requireLogin,
  validateData(userSchema.resetPasswordSchema),
  userController.resetPassword
);

userRoute.patch(
  "/:id/active",
  requireLogin,
  permitRoles(Role.BAN_GIAM_HIEU),
  userController.activeUser
);
userRoute.patch(
  "/:id/inactive",
  requireLogin,
  permitRoles(Role.BAN_GIAM_HIEU),
  userController.inactiveUser
);

module.exports = userRoute;
