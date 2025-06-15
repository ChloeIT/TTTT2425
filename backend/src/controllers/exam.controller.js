const examService = require("../services/exam.service");
const { cloudinary } = require("../libs/cloudinary");
const { cloudinary: cloudinaryArchive } = require("../libs/cloudinary_archive");
const { Department, ExamStatus } = require("../generated/prisma");

const examController = {
  createExam: async (req, res, next) => {
    try {
      const { title } = req.body;
      const createdById = req.user.id;

      if (!req.files.questionFile || !req.files.answerFile) {
        return res
          .status(400)
          .json({ error: "Thiếu file đề thi hoặc file đáp án" });
      }

      const questionFile = req.files.questionFile[0];
      const answerFile = req.files.answerFile[0];

      // Kiểm tra đuôi file
      const isPdf = (file) =>
        file.mimetype === "application/pdf" ||
        file.originalname.endsWith(".pdf");

      if (!isPdf(questionFile) || !isPdf(answerFile)) {
        throw new Error("Chỉ chấp nhận file PDF");
      }

      const exam = await examService.createExam({
        title,
        status: "DANG_CHO",
        createdById,
        questionFile: questionFile.path,
        answerFile: answerFile.path,
      });

      // Log exam vừa tạo
      console.log("Created exam:", exam);

      // Gửi response thành công
      return res.status(201).json({ ok: true, data: exam });
    } catch (error) {
      if (error.message === "Chỉ chấp nhận file PDF") {
        return res.status(400).json({ ok: false, error: error.message });
      }
      return res
        .status(500)
        .json({ ok: false, error: "Lỗi hệ thống, vui lòng thử lại sau" });
    }
  },

  getAllExams: async (req, res, next) => {
    try {
      const { status } = req.query;
      const exams = await examService.getAllExams({ status });
      res.status(200).json({ data: exams });
    } catch (error) {
      next(error);
    }
  },

  getExams: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const exams = await examService.getExamsByUserId(userId);
      res.status(200).json({ data: exams });
    } catch (error) {
      next(error);
    }
  },

  getExamById: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const exam = await examService.getExamById(id);
      if (!exam)
        return res.status(404).json({ error: "Không tìm thấy đề thi" });
      res.status(200).json({ data: exam });
    } catch (error) {
      next(error);
    }
  },

  getSignedExamFiles: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const exam = await examService.getExamById(id);
      if (!exam)
        return res.status(404).json({ error: "Không tìm thấy đề thi" });

      // Improved public_id extraction with extension
      const extractPublicId = (url) => {
        const parts = url.split("/");
        const fileNameWithExt = parts.pop(); // e.g., "1749287013182_pdf.pdf"
        const folderPath = parts.slice(parts.indexOf("exam_files")).join("/"); // e.g., "exam_files"
        const publicId = `${folderPath}/${fileNameWithExt}`; // e.g., "exam_files/1749287013182_pdf.pdf"
        return publicId;
      };

      const questionFilePublicId = extractPublicId(exam.questionFile);
      const answerFilePublicId = extractPublicId(exam.answerFile);

      // Generate signed URLs with an expiration time (e.g., 10 minutes)
      const expirationTime = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
      const signedQuestionUrl = cloudinary.utils.api_sign_request(
        {
          public_id: questionFilePublicId,
          timestamp: expirationTime,
        },
        process.env.CLOUDINARY_API_SECRET
      );
      const signedAnswerUrl = cloudinary.utils.api_sign_request(
        {
          public_id: answerFilePublicId,
          timestamp: expirationTime,
        },
        process.env.CLOUDINARY_API_SECRET
      );

      const questionUrl = cloudinary.url(questionFilePublicId, {
        resource_type: "raw",
        secure: true,
        sign_url: true,
        timestamp: expirationTime,
        signature: signedQuestionUrl,
        // Optionally specify the version if known (e.g., from the database URL)
        // version: url.match(/v(\d+)/)?.[1], // Uncomment and adjust if version is needed
      });

      const answerUrl = cloudinary.url(answerFilePublicId, {
        resource_type: "raw",
        secure: true,
        sign_url: true,
        timestamp: expirationTime,
        signature: signedAnswerUrl,
        // version: url.match(/v(\d+)/)?.[1], // Uncomment and adjust if version is needed
      });

      console.log(`Generated question URL: ${questionUrl}`); // Debug log
      console.log(`Generated answer URL: ${answerUrl}`); // Debug log

      return res.status(200).json({
        data: {
          questionFile: questionUrl,
          answerFile: answerUrl,
          expiresAt: expirationTime * 1000, // Convert to milliseconds
        },
      });
    } catch (error) {
      console.error("Error in getSignedExamFiles:", error); // Debug log
      next(error);
    }
  },

  approveExam: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const { password } = req.body;

      const updatedExam = await examService.approveExam(id, password, userId);
      res.status(200).json({ data: updatedExam });
    } catch (error) {
      next(error);
    }
  },

  rejectExam: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { message } = req.body;
      const userId = req.user.id;

      const updatedExam = await examService.rejectExam(id, message, userId);
      res.status(200).json({ data: updatedExam });
    } catch (error) {
      next(error);
    }
  },

  openExam: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Cần có mật khẩu để mở đề thi" });
      }

      const isPasswordValid = await examService.verifyPassword(id, password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Mật khẩu không hợp lệ" });
      }

      const updatedExam = await examService.openExam(id, userId);
      res.status(200).json({ data: updatedExam });
    } catch (error) {
      next(error);
    }
  },

  changeStatusExam: async (req, res, next) => {
    try {
      const examId = Number(req.params.examId);
      const { changeStatus } = req.body;

      // if (!password) {
      //   return res
      //     .status(400)
      //     .json({ error: "Password is required to open exam" });
      // }

      // const isPasswordValid = await examService.verifyPassword(id, password);
      // if (!isPasswordValid) {
      //   return res.status(401).json({ error: "Invalid password" });
      // }

      const updatedExam = await examService.changeStatus(examId, changeStatus);
      res.status(200).json({ data: updatedExam });
    } catch (error) {
      next(error);
    }
  },

  verifyExamPassword: async (req, res) => {
    try {
      const examId = Number(req.body.examId);
      const password = req.body.password;

      if (!password) {
        return res.status(400).json({ error: "Vui lòng nhập mật khẩu" });
      }
      if (!examId) {
        return res.status(400).json({ error: "Đề thi không tồn tại" });
      }

      const isValid = await examService.verifyPassword(examId, password);
      if (!isValid) {
        return res.status(401).json({ error: "Mật khẩu không đúng" });
      }

      // Lấy URL đề thi sau khi xác thực đúng
      const exam = await examService.getExamById(examId);

      return res.json({
        success: true,
        fileUrl: exam.questionFile,
      });
    } catch (error) {
      console.error("Lỗi xác thực mật khẩu:", error);
      return res.status(500).json({ error: "Lỗi hệ thống" });
    }
  },

  updateExamDocument: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const exam = await examService.getExamById(id);
      if (!exam) return res.status(404).json({ error: "Exam not found" });

      if (!req.files.questionFile || !req.files.answerFile) {
        return res
          .status(400)
          .json({ error: "Missing question or answer file" });
      }

      const questionFile = req.files.questionFile[0].path;
      const answerFile = req.files.answerFile[0].path;

      const updatedExam = await examService.updateExamDocument(id, {
        questionFile,
        answerFile,
      });

      return res.status(200).json({ ok: true, data: updatedExam });
    } catch (error) {
      console.error("Error in updateExamDocument:", error);
      if (error.message === "Chỉ chấp nhận file PDF") {
        return res.status(400).json({ ok: false, error: error.message });
      }
      return res
        .status(500)
        .json({ ok: false, error: "Lỗi hệ thống, vui lòng thử lại sau" });
    }
  },

  deleteExam: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await examService.deleteExam(id);
      res.status(200).json({ message: "Đã xóa đề thi thành công" });
    } catch (error) {
      next(error);
    }
  },

  getWaitingExamByBanGiamHieu: async (req, res, next) => {
    try {
      // validate department, status, month, year is valid
      const { department, month, page, query, year } =
        examService.validateQueryGetExamsByStatus(req);

      // truyền department=MAC_DINH...
      //truyền month >=1 và <=12
      //truyền year trong vòng 10 năm tính từ năm hiện tại 2025-2015
      //status= DANG_CHO...
      //để query
      const status = ExamStatus.DANG_CHO;
      const { data, totalPage } = await examService.getExamsByStatus({
        page,
        query,
        status,
        department,
        month,
        year,
      });
      return res.status(200).json({
        data,
        totalPage,
      });
    } catch (error) {
      next(error);
    }
  },

  getExamsForArchive: async (req, res, next) => {
    try {
      const exams = await examService.getAllExams({ status: "DA_THI" });
      res.status(200).json({ data: exams });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examController;
