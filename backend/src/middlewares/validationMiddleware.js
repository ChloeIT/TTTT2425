const { ZodError } = require("zod");
const {
  createExamSchema,
  updateExamDocumentSchema,
} = require("../schemas/exam.schema");

function validateData(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: issue.message,
          field: issue.path.join("."),
        }));

        res
          .status(400)
          .json({ error: "Dữ liệu không hợp lệ", details: errorMessages });
      } else {
        res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại sau" });
      }
    }
  };
}

function validateExam(req, res, next) {
  try {
    createExamSchema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((issue) => ({
        message: issue.message,
        field: issue.path.join("."),
      }));

      return res
        .status(400)
        .json({ error: "Dữ liệu không hợp lệ", details: errorMessages });
    }
    return res
      .status(500)
      .json({ error: "Lỗi hệ thống, vui lòng thử lại sau" });
  }

  if (!req.files || !req.files.questionFile || !req.files.answerFile) {
    return res.status(400).json({ error: "Thiếu flie đề thi hoặc file đáp án" });
  }

  next();
}

module.exports = {
  validateData,
  validateExam,
};
