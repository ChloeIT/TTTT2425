const examService = require("../services/exam.service");
const { cloudinary } = require("../libs/cloudinary");
const { cloudinary: cloudinaryArchive } = require("../libs/cloudinary_archive");
const { Department, ExamStatus } = require("../generated/prisma");
const notificationService = require("../services/notification.service");
const prisma = require("../libs/prisma");
const userService = require("../services/user.service");

const departmentMap = {
  MAC_DINH: "Mặc định",
  LY_LUAN_CO_SO: "Lý luận cơ sở",
  NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
  XAY_DUNG_DANG: "Xây dựng Đảng",
};

// Extracted reusable function to avoid duplication
const extractPublicId = (url) => {
  const parts = url.split("/");
  const fileNameWithExt = parts.pop();
  const folderPath = parts.slice(parts.indexOf("exam_files")).join("/");
  const publicId = `${folderPath}/${fileNameWithExt}`;
  return publicId;
};

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
      // Gửi thông báo
      const bghUsers = await prisma.user.findMany({
        where: {
          role: "BAN_GIAM_HIEU",
        },
      });

      const titleNotify = `Thông báo đề thi ${title} đã được soạn `;
      const messageNotify = `Đề thi "${title}" đã được soạn bởi ${
        req.user.fullName
      } - ${departmentMap[req.user.department]}.`;

      await Promise.all(
        bghUsers.map((user) =>
          notificationService.createNotificationAndSendMail({
            userId: user.id,
            title: titleNotify,
            message: messageNotify,
          })
        )
      );

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
      const { status, page = 1, query = "", department } = req.query;
      const { data, totalPage } = await examService.getApproved_Tested({
        status,
        page,
        query,
        department,
      });
      res.status(200).json({ data, totalPage });
    } catch (error) {
      next(error);
    }
  },

  getPendingExams: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { query = "" } = req.query;
      const data = await examService.getPendingExamsByUserId({ userId, query });
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  },

  getRejectedExams: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { query = "" } = req.query;
      const data = await examService.getRejectedExamsByUserId({
        userId,
        query,
      });
      res.status(200).json({ data });
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

      const questionFilePublicId = extractPublicId(exam.questionFile);
      const answerFilePublicId = extractPublicId(exam.answerFile);

      // Generate signed URLs with an expiration time (e.g., 2 minutes)
      const expirationTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
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
      });

      const answerUrl = cloudinary.url(answerFilePublicId, {
        resource_type: "raw",
        secure: true,
        sign_url: true,
        timestamp: expirationTime,
        signature: signedAnswerUrl,
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

  getSignedArchiveFiles: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const exam = await examService.getExamWithMetaById(id);
      if (!exam)
        return res.status(404).json({ error: "Không tìm thấy đề thi" });

      const now = new Date(Date.now());
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      if (exam.status !== "DA_THI" || new Date(exam.openAt) > sixHoursAgo) {
        return res.status(403).json({
          error: "Đề thi không đủ điều kiện để truy cập (chưa thi đủ 6 tiếng)",
        });
      }

      const questionFilePublicId = extractPublicId(exam.questionFile);
      const answerFilePublicId = extractPublicId(exam.answerFile);

      // Generate signed URLs with an expiration time (e.g., 2 minutes) using cloudinaryArchive
      const expirationTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
      const signedQuestionUrl = cloudinaryArchive.utils.api_sign_request(
        {
          public_id: questionFilePublicId,
          timestamp: expirationTime,
        },
        process.env.CLOUDINARY_API_SECRET
      );
      const signedAnswerUrl = cloudinaryArchive.utils.api_sign_request(
        {
          public_id: answerFilePublicId,
          timestamp: expirationTime,
        },
        process.env.CLOUDINARY_API_SECRET
      );

      const questionUrl = cloudinaryArchive.url(questionFilePublicId, {
        resource_type: "raw",
        secure: true,
        sign_url: true,
        timestamp: expirationTime,
        signature: signedQuestionUrl,
      });

      const answerUrl = cloudinaryArchive.url(answerFilePublicId, {
        resource_type: "raw",
        secure: true,
        sign_url: true,
        timestamp: expirationTime,
        signature: signedAnswerUrl,
      });

      console.log(`Generated archive question URL: ${questionUrl}`); // Debug log
      console.log(`Generated archive answer URL: ${answerUrl}`); // Debug log

      return res.status(200).json({
        data: {
          questionFile: questionUrl,
          answerFile: answerUrl,
          expiresAt: expirationTime * 1000, // Convert to milliseconds
        },
      });
    } catch (error) {
      console.error("Error in getSignedArchiveFiles:", error); // Debug log
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
      const examId = Number(req.params.examId);
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "Cần có mật khẩu để mở đề thi" });
      }
      if (!examId) {
        return res.status(400).json({ error: "Đề thi không tồn tại" });
      }
      const isExamValid = await examService.canOpenExam(examId);
      if (!isExamValid) {
        return res.status(401).json({ error: "Đề thi không hợp lệ" });
      }

      const isPasswordValid = await examService.verifyPassword(
        examId,
        password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Mật khẩu không hợp lệ" });
      }

      const exam = await examService.getExamById(examId);

      const updatedExam = await examService.openExam(exam, req.user);
      res.status(200).json({ data: updatedExam });
    } catch (error) {
      next(error);
    }
  },

  //dang tai document (trang van thu)
  updateExamDocument: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const exam = await examService.getExamById(id);
      if (!exam)
        return res.status(404).json({ error: "Không tìm thấy đề thi" });

      if (exam.document) {
        return res.status(400).json({
          ok: false,
          error: "Đã có tài liệu, không thể cập nhật thêm",
        });
      }

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

      const updatedExam = await examService.updateExamDocument(id, {
        questionFile: questionFile.path,
        answerFile: answerFile.path,
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
      const exam = await examService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ error: "Không tìm thấy đề thi" });
      }

      await examService.deleteExam(
        id,
        exam.questionFile,
        exam.answerFile,
        req.user.id
      );

      res.status(200).json({ message: "Đã xóa đề thi thành công" });
    } catch (error) {
      console.error("Error in deleteExam:", error);
      next(error);
    }
  },

  deleteExamDocument: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const exam = await examService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ error: "Không tìm thấy đề thi" });
      }
      if (!exam.document) {
        return res
          .status(400)
          .json({ error: "Đề thi không có tài liệu để xóa" });
      }

      await examService.deleteExamDocument(id);

      res
        .status(200)
        .json({ message: "Đã xóa tài liệu của đề thi thành công" });
    } catch (error) {
      console.error("Error in deleteExamDocument:", error);
      next(error);
    }
  },

  getWaitingExamByBanGiamHieu: async (req, res, next) => {
    try {
      const { department, month, status, page, query, year } =
        examService.validateQueryGetExamsByStatus(req);

      // truyền department=MAC_DINH...
      //truyền month >=1 và <=12
      //truyền year trong vòng 10 năm tính từ năm hiện tại 2025-2015
      //status= DANG_CHO...
      //để query
      // const status = ExamStatus.DANG_CHO;
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

  getOpenedExams: async (req, res, next) => {
    try {
      const { page = 1, query = "", department } = req.query;

      const { data, totalPage } = await examService.getExamsByStatus({
        page: Number(page),
        query,
        status: "DA_DUYET",
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        department,
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
      const { page, query, department, month, year } =
        examService.validateQueryGetExamsByStatus(req);
      const status = "DA_THI"; // Fixed status for archive

      const { data, totalPage } = await examService.getExamsByStatus({
        page,
        query,
        status,
        department,
        month,
        year,
      });

      // Sort data by openAt in descending order (newest first)
      data.sort((a, b) => new Date(b.openAt) - new Date(a.openAt));

      return res.status(200).json({
        data,
        totalPage,
      });
    } catch (error) {
      next(error);
    }
  },

  getExamsforDean: async (req, res, next) => {
    try {
      const { page = 1, query = "" } =
        examService.validateQueryGetExamsByStatus(req);
      const { data, totalPage } = await examService.getExamsByStatus({
        page: Number(page),
        query,
        status: "DANG_CHO",
      });

      return res.status(200).json({
        data,
        totalPage,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examController;
