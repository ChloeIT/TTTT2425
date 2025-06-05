const { Router } = require("express");
const requireLogin = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notification.controller");
const notificationRoute = Router();

notificationRoute.get(
  "/",
  requireLogin,
  notificationController.getNotifications
);

notificationRoute.patch(
  "/read",
  requireLogin,

  notificationController.updateReadNotifications
);
module.exports = notificationRoute;
