const { Router } = require("express");
const secretaryController = require("../controllers/secretary.controller");
const requireLogin = require("../middlewares/authMiddleware");
const permitRoles = require("../middlewares/roleMiddleware");
const { validateData } = require("../middlewares/validationMiddleware");

const { createNotificationSchema } = require("../schemas/secretary.schema");

const examRouter = Router();

examRouter.get(
  "/signed-exam",
  requireLogin,
  permitRoles("THU_KY"),
  secretaryController.getSignedExams
);

examRouter.get(
  "/getEmailUsers",
  requireLogin,
  permitRoles("THU_KY"),
  secretaryController.getEmailUsers
);
examRouter.post(
  "/notify",
  requireLogin,
  permitRoles("THU_KY"),
  validateData(createNotificationSchema),
  secretaryController.sendNotification
);

module.exports = examRouter;
