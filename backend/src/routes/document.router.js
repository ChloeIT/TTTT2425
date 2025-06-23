const express = require("express");
const router = express.Router();
const prisma = require("../libs/prisma");
const documentController = require("../controllers/document.controller");
const requireLogin = require("../middlewares/authMiddleware");
const { verifyPassword } = require("../services/document.service");

// Route lấy danh sách documents

router.post("/verify-password", requireLogin, async (req, res) => {
  const { documentId, password } = req.body;

  try {
    const isValid = await verifyPassword(documentId, password);

    if (isValid) {
      return res.status(200).json({ success: true });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu không đúng" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});
router.get("/", requireLogin, documentController.getDocuments);

router.get(
  "/:id/signed-files",
  requireLogin,
  documentController.getSignedDocumentFiles
);

module.exports = router;
