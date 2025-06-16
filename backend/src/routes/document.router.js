const express = require("express");
const router = express.Router();
const prisma = require("../libs/prisma");
const documentController = require("../controllers/document.controller");

// Route lấy danh sách documents
router.get("/", documentController.getDocuments);


router.get("/:id/signed-files", documentController.getSignedDocumentFiles);

module.exports = router;
