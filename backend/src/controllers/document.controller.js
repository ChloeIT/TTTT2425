const cloudinary = require("cloudinary").v2;
const documentService = require("../services/document.service");

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
module.exports = {
  getSignedDocumentFiles,
};
