const { Router } = require("express");
const examController = require("../controllers/exam.controller");
const requireLogin = require("../middlewares/authMiddleware");
const {
  validateData,
  validateExam,
  validateUploadExamDocument,
} = require("../middlewares/validationMiddleware");
const permitRoles = require("../middlewares/roleMiddleware");
const { parser: examParser } = require("../libs/cloudinary");
const { parser: archiveParser } = require("../libs/cloudinary_archive");

const {
  createExamSchema,
  approveExamSchema,
  rejectExamSchema,
  openExamSchema,
  updateExamDocumentSchema,
} = require("../schemas/exam.schema");

const examRouter = Router();

examRouter.post(
  "/",
  requireLogin,
  permitRoles("TRUONG_KHOA", "GIANG_VIEN_RA_DE"),
  examParser.fields([
    { name: "questionFile", maxCount: 1 },
    { name: "answerFile", maxCount: 1 },
  ]),
  validateExam,
  examController.createExam
);


//BGH
examRouter.get(
  "/all",
  requireLogin,
  // permitRoles("BAN_GIAM_HIEU"),
  examController.getAllExams
);
//user
examRouter.get(
  "/approved",
  requireLogin,
  examController.getAllExams
);


//lấy danh sách đề thi theo người soạn ( user hiện tại đang đăng nhập)
examRouter.get("/", requireLogin, examController.getExams);

examRouter.get("/:id", requireLogin, examController.getExamById);

examRouter.get(
  "/:id/files",
  requireLogin,
  // permitRoles("BAN_GIAM_HIEU", "TRUONG_KHOA"),
  examController.getSignedExamFiles
);

examRouter.post(
  "/verify-password",
  requireLogin,
  examController.verifyExamPassword
);

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

examRouter.patch(
  "/:id/document",
  requireLogin,
  permitRoles("VAN_THU"),
  archiveParser.fields([
    { name: "questionFile", maxCount: 1 },
    { name: "answerFile", maxCount: 1 },
  ]),
  // validateUploadExamDocument,
  examController.updateExamDocument
);

examRouter.patch(
  "/:examId/changeStatus",
  requireLogin,
  // validateData(openExamSchema),
  examController.changeStatusExam
);

// examRouter.delete("/:id", requireLogin, examController.deleteExam);

module.exports = examRouter;
