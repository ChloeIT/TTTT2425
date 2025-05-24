const { Router } = require("express");
const examController = require("../controllers/exam.controller");
const requireLogin = require("../middlewares/authMiddleware");
const validateData = require("../middlewares/validationMiddleware");
const permitRoles = require("../middlewares/roleMiddleware");
const { parser } = require("../libs/cloudinary");

const {
  createExamSchema,
  approveExamSchema,
  openExamSchema,
} = require("../schemas/exam.schema");

const examRouter = Router();

examRouter.post(
  "/",
  requireLogin,
  parser.fields([
    { name: "questionFile", maxCount: 1 },
    { name: "answerFile", maxCount: 1 },
  ]),
  validateData(createExamSchema),
  examController.createExam
);

examRouter.get("/", requireLogin, examController.getExams);
examRouter.get("/:id", requireLogin, examController.getExamById);

examRouter.patch(
  "/:id/approve",
  requireLogin,
  permitRoles("BAN_GIAM_HIEU", "TRUONG_KHOA"),
  validateData(approveExamSchema),
  examController.approveExam
);

examRouter.patch(
  "/:id/open",
  requireLogin,
  validateData(openExamSchema),
  examController.openExam
);

examRouter.delete("/:id", requireLogin, examController.deleteExam);

module.exports = examRouter;
