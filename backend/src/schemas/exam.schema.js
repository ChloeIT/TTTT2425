const { z } = require("zod");

const createExamSchema = z.object({
  title: z
    .string({
      required_error: "Tên bài thi là trường bắt buộc phải điền",
      invalid_type_error: "Tên bài thi phải là chuỗi ký tự",
    })
    .min(1, "Tên bài thi là trường bắt buộc phải điền"),
});

const approveExamSchema = z.object({
  password: z
    .string({
      required_error: "Mật khẩu là trường bắt buộc phải điền",
      invalid_type_error: "Mật khẩu phải là chuỗi ký tự",
    })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const rejectExamSchema = z.object({
  message: z
    .string({
      required_error: "Ghi chú là trường bắt buộc phải điền",
      invalid_type_error: "Ghi chú phải là chuỗi ký tự",
    })
    .min(1, "Ghi chú là trường bắt buộc phải điền"),
});

const openExamSchema = z.object({
  password: z
    .string({
      required_error: "Mật khẩu là trường bắt buộc phải điền để mở bài thi",
      invalid_type_error: "Mật khẩu phải là chuỗi ký tự",
    })
    .min(1, "Mật khẩu là trường bắt buộc phải điền để mở bài thi"),
});

module.exports = {
  createExamSchema,
  approveExamSchema,
  rejectExamSchema,
  openExamSchema,
};