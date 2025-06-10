const { Router } = require("express");
const examController = require("../controllers/exam.controller");
const requireLogin = require("../middlewares/authMiddleware");
const {
  validateData,
  validateExam,
} = require("../middlewares/validationMiddleware");
const permitRoles = require("../middlewares/roleMiddleware");
const { parser } = require("../libs/cloudinary");

const {
  createExamSchema,
  approveExamSchema,
  rejectExamSchema,
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
  validateExam,
  examController.createExam
);

examRouter.get(
  "/all",
  requireLogin,
  permitRoles("BAN_GIAM_HIEU"),
  examController.getAllExams
);

examRouter.get("/", requireLogin, examController.getExams);

examRouter.get("/:id", requireLogin, examController.getExamById);

examRouter.get(
  "/:id/files",
  requireLogin,
  // permitRoles("BAN_GIAM_HIEU", "TRUONG_KHOA"),
  examController.getSignedExamFiles
);


examRouter.post("/verify-password", examController.verifyExamPassword);


examRouter.patch(
  "/:id/approve",
  requireLogin,
  permitRoles("BAN_GIAM_HIEU"),
  validateData(approveExamSchema),
  examController.approveExam
);

examRouter.patch(
  "/:id/reject",
  requireLogin,
  permitRoles("BAN_GIAM_HIEU"),
  validateData(rejectExamSchema),
  examController.rejectExam
);

examRouter.patch(
  "/:id/open",
  requireLogin,
  validateData(openExamSchema),
  examController.openExam
);

examRouter.delete("/:id", requireLogin, examController.deleteExam);

module.exports = examRouter;