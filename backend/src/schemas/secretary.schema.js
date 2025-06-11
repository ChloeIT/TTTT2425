const { z } = require("zod");

const createNotificationSchema = z.object({
  email: z
    .string({
      required_error: "Email là trường bắt buộc phải điền",
      invalid_type_error: "Email phải là chuỗi ký tự",
    })
    .email("Email không hợp lệ"),

  password: z
    .string({
      required_error: "Mật khẩu là trường bắt buộc phải điền",
      invalid_type_error: "Mật khẩu phải là chuỗi ký tự",
    })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

  titleExam: z
    .string({
      required_error: "Tên bài thi là trường bắt buộc phải điền",
      invalid_type_error: "Tên bài thi phải là chuỗi ký tự",
    })
    .min(1, "Tên bài thi là trường bắt buộc"),
});

module.exports = {
  createNotificationSchema,
};
