const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Đường dẫn tuyệt đối đến folder lưu file signature
const uploadDir = path.join(__dirname, "../uploads/signature");

// Tạo folder nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValidMime = allowedTypes.test(file.mimetype);
  const isValidExt = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png)"));
  }
};

const uploadSignature = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

module.exports = uploadSignature;
