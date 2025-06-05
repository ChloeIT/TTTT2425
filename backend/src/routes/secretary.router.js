const { Router } = require("express");
const secretaryController = require("../controllers/secretary.controller");
const requireLogin = require("../middlewares/authMiddleware");
const permitRoles = require("../middlewares/roleMiddleware");
const {
  validateData,
  validateExam,
} = require("../middlewares/validationMiddleware");


const examRouter = Router();

examRouter.get(
  "/allExams",
  requireLogin,
  permitRoles("THU_KY"),
  secretaryController.getExamsForSecretary
);

module.exports = examRouter;
