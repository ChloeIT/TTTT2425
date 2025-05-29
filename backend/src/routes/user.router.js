const { Router } = require("express");
const validateData = require("../middlewares/validationMiddleware");
const userSchema = require("../schemas/user.schema");
const requireLogin = require("../middlewares/authMiddleware");
const userController = require("../controllers/user.controller");
const permitRoles = require("../middlewares/roleMiddleware");
const { Role } = require("../generated/prisma");
const userRoute = Router();

userRoute.patch(
  "/edit",
  requireLogin,
  validateData(userSchema.updateSchema),
  userController.updateUser
);

userRoute.patch(
  "/resetPassword",
  requireLogin,
  validateData(userSchema.resetPasswordSchema),
  userController.resetPassword
);

userRoute.get(
  "/",
  requireLogin,
  permitRoles(Role.BAN_GIAM_HIEU),
  userController.getUserTable
);
userRoute.patch(
  "/:id/editRole",
  requireLogin,
  permitRoles(Role.BAN_GIAM_HIEU),
  validateData(userSchema.editRoleSchema),
  userController.editRole
);
userRoute.patch(
  "/:id/editDepartment",
  requireLogin,
  permitRoles(Role.BAN_GIAM_HIEU),
  validateData(userSchema.editDepartmentSchema),
  userController.editDepartment
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
