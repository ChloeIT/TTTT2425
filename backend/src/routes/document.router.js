const express = require("express");
const router = express.Router();
const prisma = require("../libs/prisma");
const documentController = require("../controllers/document.controller");
const requireLogin = require("../middlewares/authMiddleware");
const { verifyPassword } = require("../services/document.service");

// Route lấy danh sách documents

router.post(
  "/verify-password",
  requireLogin,
  documentController.verifyExamPassword
);

router.get("/", requireLogin, documentController.getDocuments);

router.get(
  "/:id/signed-files",
  requireLogin,
  documentController.getSignedDocumentFiles
);

module.exports = router;
