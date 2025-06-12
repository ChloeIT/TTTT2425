const { z } = require("zod");

const createExamSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
});

const approveExamSchema = z.object({
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
const rejectExamSchema = z.object({
  message: z.string().min(1, "Ghi chú không được để trống"),
});

const openExamSchema = z.object({
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

module.exports = {
  createExamSchema,
  approveExamSchema,
  rejectExamSchema,
  openExamSchema,
};
