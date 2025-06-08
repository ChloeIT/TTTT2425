const examService = require("../services/exam.service");

const examController = {
  createExam: async (req, res, next) => {
    try {
      const { title } = req.body;
      const createdById = req.user.id;

      if (!req.files.questionFile || !req.files.answerFile) {
        return res
          .status(400)
          .json({ error: "Missing question or answer file" });
      }

      const questionFile = req.files.questionFile[0].path;
      const answerFile = req.files.answerFile[0].path;

      const exam = await examService.createExam({
        title,
        status: "DANG_CHO",
        createdById,
        questionFile,
        answerFile,
      });

      // Log exam vừa tạo
      console.log("Created exam:", exam);

      // Gửi response thành công
      return res.status(201).json({ data: exam });
    } catch (error) {
      // Trả lỗi rõ ràng, không gọi next() nữa
      return res
        .status(500)
        .json({ error: "Lỗi hệ thống, vui lòng thử lại sau1" });
    }
  },

  getAllExams: async (req, res, next) => {
    try {
      const exams = await examService.getAllExams();
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
      if (!exam) return res.status(404).json({ error: "Exam not found" });
      res.status(200).json({ data: exam });
    } catch (error) {
      next(error);
    }
  },

  approveExam: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      if (!["BAN_GIAM_HIEU", "TRUONG_KHOA"].includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

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

      if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Ghi chú không được bỏ trống" });
      }

      if (!["BAN_GIAM_HIEU"].includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updatedExam = await examService.rejectExam(id, message,userId);
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
        return res
          .status(400)
          .json({ error: "Password is required to open exam" });
      }

      const isPasswordValid = await examService.verifyPassword(id, password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      const updatedExam = await examService.openExam(id, userId);
      res.status(200).json({ data: updatedExam });
    } catch (error) {
      next(error);
    }
  },

  deleteExam: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await examService.deleteExam(id);
      res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examController;
