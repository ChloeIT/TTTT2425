const secretaryService = require("../services/secretary.service");
const prisma = require("../libs/prisma");
const { cloudinary: cloudinaryArchive } = require("../libs/cloudinary_archive");

const secretaryController = {
  getSignedExams: async (req, res, next) => {
    try {
      const { department, month, page, query, year } =
        secretaryService.validateQuerySignedExam(req);

      const { data, totalPage } =
        await secretaryService.getExamsWithDecryptedPasswords({
          page,
          query,
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

  getEmailUsers: async (req, res, next) => {
    try {
      const emails = await secretaryService.getAllUserEmails();
      res.status(200).json({ data: emails });
    } catch (error) {
      next(error);
    }
  },

  sendNotification: async (req, res) => {
    try {
      const { email, password, titleExam, type } = req.body;
  
      if (type === "question") {
        await secretaryService.notifyUserByEmail(email, password, titleExam);
      }
  
      if (type === "answer") {
        await secretaryService.notifyUserWithAnswer(email, password, titleExam);
      }
  
      return res.status(200).json({ message: `Đã gửi thông báo tới ${email}` });
    } catch (error) {
      console.error("sendNotification error:", error);
      return res.status(500).json({ message: "Lỗi server khi gửi thông báo" });
    }
  },  

  getSignedExamsWithDocuments: async (req, res, next) => {
    try {
      const { department, month, page, query, year } =
        secretaryService.validateQuerySignedExam(req);

      const { data, totalPage } =
        await secretaryService.getSignedExamsWithDocuments({
          page,
          query,
          department,
          month,
          year,
        });

      return res.status(200).json({ data, totalPage });
    } catch (error) {
      next(error);
    }
  },

  getSignedExamFiles: async (req, res, next) => {
    try {
      const examId = Number(req.params.id);

      const document = await prisma.document.findUnique({
        where: { examId },
      });

      if (!document) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy document của đề thi" });
      }

      const extractPublicId = (url) => {
        const parts = url.split("/");
        const fileNameWithExt = parts.pop();
        const folderPath = parts.slice(parts.indexOf("exam_files")).join("/");
        return `${folderPath}/${fileNameWithExt}`;
      };

      const questionFilePublicId = extractPublicId(document.questionFile);
      const answerFilePublicId = extractPublicId(document.answerFile);

      const expirationTime = Math.floor(Date.now() / 1000) + 600;

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
      console.log(questionUrl)
      return res.status(200).json({
        data: {
          questionFile: questionUrl,
          answerFile: answerUrl,
          expiresAt: expirationTime * 1000,
        },
      });
    } catch (error) {
      console.error("Error in getSignedExamFiles:", error);
      next(error);
    }
  },

};

module.exports = secretaryController;
