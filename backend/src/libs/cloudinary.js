const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const ext = path.extname(file.originalname); // lấy đuôi file ví dụ: '.docx' hoặc '.pdf'
    const timestamp = Date.now();

    return {
      folder: "exam_files",
      resource_type: "raw", // đặt raw để upload file tài liệu
      public_id: `${timestamp}${ext.replace(".", "_")}`, // thay '.' bằng '_' hoặc giữ nguyên nếu muốn
      // hoặc nếu giữ dấu '.' thì để `${timestamp}${ext}`
      access_mode: "public",
      format: ext.replace(".", ""), // chỉ định format cho Cloudinary, ví dụ: 'docx', 'pdf'
    };
  },
});

const parser = multer({ storage });

module.exports = { cloudinary, parser };
