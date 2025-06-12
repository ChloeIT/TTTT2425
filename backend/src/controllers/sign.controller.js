const axios = require("axios");
const fs = require("fs");
const path = require("path");
const prisma = require("../libs/prisma");
const signService = require("../services/sign.service");

const signController = {
  signDocument: async (req, res, next) => {
    try {
      const fileUrl = req.body.pdfUrl;
      const exam_id = req.body.exam_id;
      const fileType = req.body.fileType;
      if (!fileUrl) {
        return res.status(400).json({ message: "Thiếu URL file PDF" });
      }
      if (!exam_id) {
        return res.status(400).json({ message: "Thiếu exam_id" });
      }
      if (!fileType) {
        return res.status(400).json({ message: "Thiếu file_Type" });
      }
      const userId = req.user.id;

      const signatureData = await prisma.signature.findUnique({
        where: { userId },
      });
      if (!signatureData || !signatureData.path) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy chữ ký cho user" });
      }

      const signatureFilename = signatureData.path;
      const signatureFilePath = path.join(
        __dirname,
        "../uploads/signature/",
        signatureFilename
      );

      if (!fs.existsSync(signatureFilePath)) {
        return res
          .status(404)
          .json({ message: "File chữ ký không tồn tại trên server" });
      }

      const ext = path.extname(fileUrl).toLowerCase();
      if (![".pdf", ".docx"].includes(ext)) {
        return res
          .status(400)
          .json({ message: "Chỉ hỗ trợ file PDF hoặc DOCX" });
      }

      const tempFilePath = path.join(__dirname, `../uploads/temp_file${ext}`);

      const writer = fs.createWriteStream(tempFilePath);
      const response = await axios.get(fileUrl, { responseType: "stream" });

      await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      let signedPath;
      if (ext === ".docx") {
        signedPath = await signService.insertSignatureToDocx(
          tempFilePath,
          signatureFilePath,
          exam_id,
          fileType
        );
      } else {
        signedPath = await signService.insertSignature(
          tempFilePath,
          signatureFilePath,
          signatureFilename,
          exam_id,
          fileType
        );
      }

      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

      return res.status(200).json({
        success: true,
        message: "Tệp đã được ký thành công!",
        signedFile: `${req.protocol}://${req.get("host")}${signedPath}`,
        exam_id,
      });
    } catch (err) {
      console.error("Lỗi controller signDocument:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi server!",
      });
    }
  },

  uploadSignature: async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Chưa có file signatureImage được upload" });
      }

      const allowedExt = [".png", ".jpg", ".jpeg"];
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!allowedExt.includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ error: "Chỉ cho phép upload file PNG hoặc JPG/JPEG" });
      }

      const userId = req.user.id;
      const filePath = req.file.path;
      const password = req.body.password;

      if (!password) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Mật khẩu là bắt buộc" });
      }

      const savedSignature = await signService.saveSignature({
        userId,
        filePath,
        password,
      });

      if (!savedSignature) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return res.status(409).json({ error: "Người dùng đã có chữ ký rồi" });
      }

      return res.json({
        message: "Upload file chữ ký thành công",
        signature: savedSignature,
      });
    } catch (error) {
      console.error("Lỗi uploadSignature:", error);

      // Xoá file nếu có lỗi xảy ra
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({ error: error.message || "Lỗi server" });
    }
  },
};

module.exports = signController;
