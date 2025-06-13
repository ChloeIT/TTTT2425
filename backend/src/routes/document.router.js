const express = require("express");
const router = express.Router();
const prisma = require("../libs/prisma");
const documentController = require("../controllers/document.controller");

// Route lấy danh sách documents
router.get("/", async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: { exam: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: documents });
  } catch (err) {
    console.error("Lỗi lấy documents:", err);
    res.status(500).json({ error: "Lỗi server khi lấy documents" });
  }
});


router.get("/:id/signed-files", documentController.getSignedDocumentFiles);
module.exports = router;
