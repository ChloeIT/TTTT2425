const cloudinary = require("cloudinary").v2;
const { ExamStatus } = require("../generated/prisma");
const { use } = require("../libs/mail");
const documentService = require("../services/document.service");
const examService = require("../services/exam.service");
const notificationService = require("../services/notification.service");

const getSignedDocumentFiles = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const document = await documentService.getDocumentById(id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const extractPublicId = (url) => {
      const parts = url.split("/");
      const fileNameWithExt = parts.pop(); // e.g., "1749478399951_pdf.pdf"
      const folderPath = parts.slice(parts.indexOf("exam_files")).join("/"); // e.g., "exam_files"
      const publicId = `${folderPath}/${fileNameWithExt}`;
      return publicId;
    };

    const expirationTime = Math.floor(Date.now() / 1000) + 600;

    const questionPublicId = extractPublicId(document.questionFile);
    const answerPublicId = extractPublicId(document.answerFile);

    const signedQuestionSig = cloudinary.utils.api_sign_request(
      {
        public_id: questionPublicId,
        timestamp: expirationTime,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    const signedAnswerSig = cloudinary.utils.api_sign_request(
      {
        public_id: answerPublicId,
        timestamp: expirationTime,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    const questionUrl = cloudinary.url(questionPublicId, {
      resource_type: "raw",
      secure: true,
      sign_url: true,
      timestamp: expirationTime,
      signature: signedQuestionSig,
    });

    const answerUrl = cloudinary.url(answerPublicId, {
      resource_type: "raw",
      secure: true,
      sign_url: true,
      timestamp: expirationTime,
      signature: signedAnswerSig,
    });

    return res.status(200).json({
      data: {
        questionFile: questionUrl,
        answerFile: answerUrl,
        expiresAt: expirationTime * 1000,
      },
    });
  } catch (err) {
    console.error("Error in getSignedDocumentFiles:", err);
    next(err);
  }
};
const getDocuments = async (req, res, next) => {
  try {
    const { department, month, page, query, year } =
      examService.validateQueryGetExamsByStatus(req);

    // truyền department=MAC_DINH...
    //truyền month >=1 và <=12
    //truyền year trong vòng 10 năm tính từ năm hiện tại 2025-2015
    //status= DANG_CHO...
    //để query

    const { data, totalPage } =
      await documentService.getExamsByStatusWithDocuments({
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
};
const verifyExamPassword = async (req, res) => {
  try {
    const { documentId, password } = req.body;

    if (!documentId || !password) {
      return res.status(400).json({ message: "Thiếu mật khẩu" });
    }

    const isValid = await documentService.verifyPassword(documentId, password);

    if (!isValid) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }
    const document = await documentService.getDocumentById(documentId);
    notificationService.notifyOpenAnswer(
      req.user.id,
      document.exam.title,
      req.user.fullName,
      req.user.department
    );
    return res.status(200).json({ message: "Xác minh thành công" });
  } catch (error) {
    console.error("Lỗi verifyExamPassword:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

module.exports = {
  getSignedDocumentFiles,
  getDocuments,
  verifyExamPassword,
};
