
// const { Router } = require("express");
// const signController = require("../controllers/sign.controller");
// const requireLogin = require("../middlewares/authMiddleware");
// const validateData = require("../middlewares/validationMiddleware"); 


// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
// const uploadSignature = require("../middlewares/multerSignature");

// const {
//   uploadSignatureSchema,
//   signExamSchema,
// } = require("../schemas/sign.schema");

// const signRouter = Router();


// signRouter.post(
//   "/signdocument",
//   requireLogin,
//   upload.fields([{ name: "signatureImage", maxCount: 1 }]),

//   signController.signDocument,
  
// );


// signRouter.post(
//   "/uploadsignature",
//   requireLogin,
//   uploadSignature.single("signatureImage"),

//   signController.uploadSignature
// );

// module.exports = signRouter;
