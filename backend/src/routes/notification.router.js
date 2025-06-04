const { Router } = require("express");
const requireLogin = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notification.controller");
const notificationSchema = require("../schemas/notification.schema");
const validateData = require("../middlewares/validationMiddleware");
const notificationRoute = Router();

notificationRoute.get(
  "/",
  requireLogin,
  notificationController.getNotifications
);

notificationRoute.post(
  "/read",
  requireLogin,
  validateData(notificationSchema.setReadSchema),
  notificationController.updateReadNotifications
);
module.exports = notificationRoute;
