const { z } = require("zod");

const uploadSignatureSchema = z.object({
  password: z.string().min(1, "Password không được để trống"),
});

const signExamSchema = z.object({
  pdfUrl: z.string().url("pdfUrl phải là một URL hợp lệ"),
  exam_id: z.string().min(1, "exam_id không được để trống"),
  fileType: z.enum(["question", "answer"], {
    errorMap: () => ({ message: "fileType phải là 'question' hoặc 'answer'" }),
  }),
});

module.exports = {
  uploadSignatureSchema,
  signExamSchema,
};
