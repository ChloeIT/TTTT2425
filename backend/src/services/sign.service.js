
const prisma = require("../libs/prisma");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const PizZip = require("pizzip");
const { DOMParser } = require("xmldom");
const bcrypt = require("bcrypt");
const { cloudinary } = require("../libs/cloudinary_signed");

const outputDir = path.join(__dirname, "../uploads/file_approved");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });



const signService = {
  saveSignature: async ({ userId, filePath, password }) => {
    try {
  
      const existingSignature = await prisma.signature.findUnique({
        where: { userId },
      });

      if (existingSignature) {
        throw new Error("Người dùng đã có chữ ký rồi");
      }
   
      const fileName = path.basename(filePath);
      const hashedPassword = await bcrypt.hash(password, 10);

      const saved = await prisma.signature.create({
        data: {
          userId,
          path: fileName,
          password: hashedPassword,
        },
      });

      return saved;
    } catch (error) {
      console.error("Lỗi saveSignature service:", error);
      throw error;
    }
  },

  insertSignature: async (pdfPath, signaturePath, signatureOriginalName,exam_id,fileType) => {
    console.log(exam_id)
    const pdfBytes = fs.readFileSync(pdfPath);
    const imageBytes = fs.readFileSync(signaturePath);
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

    const data = new Uint8Array(pdfBytes);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    const fullText = textContent.items.map((item) => item.str).join("");
    if (fullText.includes("Hiệu trưởng")) {
      const index = fullText.indexOf("Hiệu trưởng");
      let charCount = 0;
      let foundIndex = 0;
      for (let i = 0; i < textContent.items.length; i++) {
        charCount += textContent.items[i].str.length;
        if (charCount > index) {
          foundIndex = i;
          break;
        }
      }
      foundPosition = {
        x: textContent.items[foundIndex].transform[4] - 10,
        y: textContent.items[foundIndex].transform[5] - 53,
      };
    } else {
      throw new Error('Không tìm thấy từ "Hiệu trưởng" trong tài liệu PDF.');
    }

    // Chèn chữ ký vào PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const ext = path.extname(signatureOriginalName).toLowerCase();
    let signatureImage;

    let scaleFactor = 0;

    if (ext === ".png") {
      signatureImage = await pdfDoc.embedPng(imageBytes);
      scaleFactor = 0.09;
    } else if (ext === ".jpg" || ext === ".jpeg") {
      signatureImage = await pdfDoc.embedJpg(imageBytes);
      scaleFactor = 0.05;
    } else {
      throw new Error("Chỉ hỗ trợ file ảnh PNG và JPG");
    }

    const signatureDims = signatureImage.scale(scaleFactor);
    const firstPage = pages[0];

    firstPage.drawImage(signatureImage, {
      x: foundPosition.x,
      y: foundPosition.y,
      width: signatureDims.width,
      height: signatureDims.height,
    });

    const signedPdfBytes = await pdfDoc.save();
    const filename = `signed_${Date.now()}.pdf`;
    const signedPdfPath = path.join(outputDir, filename);

    fs.writeFileSync(signedPdfPath, signedPdfBytes);
    fs.unlinkSync(pdfPath);

    // ======= UPLOAD LÊN CLOUDINARY =======
    const cloudinaryResult = await cloudinary.uploader.upload(signedPdfPath, {
      resource_type: "raw", // Vì đây là PDF, dùng raw
      folder: "exam_signed",
      public_id: filename.replace(".pdf", ""),
      format: "pdf",
      access_mode: "public",
    });
    // // Xóa file local sau khi upload
    // fs.unlinkSync(signedPdfPath);

    if (exam_id) {
      const updateData = {};
      if (fileType === "question") {
        updateData.questionFile = cloudinaryResult.secure_url;
      } else if (fileType === "answer") {
        updateData.answerFile = cloudinaryResult.secure_url;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.exam.update({
          where: { id: Number(exam_id) },
          data: updateData,
        });
      }
    }
    
    return {
      localPath: `/uploads/file_approved/${filename}`, // local
      cloudinaryUrl: cloudinaryResult.secure_url, // URL file trên Cloudinary
    };
  },

  insertSignatureToDocx: async (docxPath, signaturePath = null,exam_id,fileType) => {
    const tempFilePath = docxPath;
    try {
      const content = fs.readFileSync(docxPath, "binary");
      const zip = new PizZip(content);

      const marker = "{signature}";
      const documentXmlPath = "word/document.xml";
      let documentXml = zip.file(documentXmlPath).asText();

      // === Tìm và chèn {signature} ===
      if (!documentXml.includes(marker)) {
        const searchText = "Hiệu trưởng";
        const paragraphs = documentXml.match(/<w:p[\s\S]*?<\/w:p>/g);
        if (!paragraphs)
          throw new Error("Không tìm thấy đoạn <w:p> nào trong tài liệu.");

        let foundIndex = -1;
        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i];
          const texts = [...p.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)];
          const fullText = texts.map((t) => t[1]).join("");
          if (fullText.includes(searchText)) {
            foundIndex = i;
            break;
          }
        }

        if (foundIndex === -1)
          throw new Error(
            `Không tìm thấy đoạn "${searchText}" trong tài liệu.`
          );

        let endIndex = foundIndex + 1;
        while (endIndex < paragraphs.length && endIndex < foundIndex + 4) {
          const p = paragraphs[endIndex];
          const hasText = /<w:t[^>]*>.*?<\/w:t>/.test(p);
          if (hasText) break;
          documentXml = documentXml.replace(p, "");
          endIndex++;
        }

        const foundParagraph = paragraphs[foundIndex];
        const newSignatureParagraph = `
          <w:p>
            <w:pPr>
              <w:ind w:left="-800"/>
            </w:pPr>
            <w:r>
              <w:t>${marker}</w:t>
            </w:r>
          </w:p>
        `;
        documentXml = documentXml.replace(
          foundParagraph,
          foundParagraph + newSignatureParagraph
        );
        zip.file(documentXmlPath, documentXml);
      }

      if (!signaturePath) {
        throw new Error("Chưa cung cấp ảnh chữ ký.");
      }

      const imageRelId = `rId${Date.now()}`;
      const imageXml = `
        <w:r>
          <w:rPr><w:noProof/></w:rPr>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0"
              xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
              xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
              xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
              xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
              <wp:extent cx="1600000" cy="600000"/>
              <wp:docPr id="1" name="Signature"/>
              <a:graphic>
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic>
                    <pic:blipFill>
                      <a:blip r:embed="${imageRelId}" cstate="none"/>
                      <a:stretch><a:fillRect/></a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm><a:off x="0" y="0"/><a:ext cx="1600000" cy="600000"/></a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        </w:r>
      `;
      documentXml = documentXml.replace(marker, `<w:r>${imageXml}</w:r>`);
      zip.file(documentXmlPath, documentXml);

      const relsPath = "word/_rels/document.xml.rels";
      let relsXml = zip.file(relsPath).asText();
      const relationship = `<Relationship Id="${imageRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/signature.png"/>`;
      relsXml = relsXml.replace(
        "</Relationships>",
        `${relationship}</Relationships>`
      );
      zip.file(relsPath, relsXml);

      const signatureImageContent = fs.readFileSync(signaturePath);
      zip.file("word/media/signature.png", signatureImageContent);

      const buffer = zip.generate({ type: "nodebuffer" });
      const filename = `signed_${Date.now()}.docx`;
      const outputFilePath = path.join(outputDir, filename);

      fs.writeFileSync(outputFilePath, buffer);

      //  UPLOAD LÊN CLOUDINARY
      const cloudinaryResult = await cloudinary.uploader.upload(
        outputFilePath,
        {
          resource_type: "raw",
          folder: "exam_signed",
          public_id: filename.replace(".docx", ""),
          format: "docx",
          access_mode: "public",
        }
      );
      // Cập nhật trường questionFile/answerFile cho exam
      if (exam_id) {
        const updateData = {};
        if (fileType === "question") {
          updateData.questionFile = cloudinaryResult.secure_url;
        } else if (fileType === "answer") {
          updateData.answerFile = cloudinaryResult.secure_url;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.exam.update({
            where: { id: Number(exam_id) },
            data: updateData,
          });
        }
      }
      
      return {
        localPath: `/uploads/file_approved/${filename}`,
        cloudinaryUrl: cloudinaryResult.secure_url,
      };
    } finally {
      if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
    }
  },
};

module.exports = signService;
