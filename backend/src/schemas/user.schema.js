const { z } = require("zod");
const { Role, Department } = require("../generated/prisma");

const userSchema = {
  editProfileSchema: z.object({
    username: z
      .string({
        required_error: "username là trường bắt buộc phải điền",
        invalid_type_error: "username bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài của username ít nhất 6 ký tự")
      .max(20, "Độ dài của username tối đa 20 ký tự")
      .nullish(),
    email: z
      .string({
        required_error: "Địa chỉ email là trường bắt buộc phải điền",
        invalid_type_error: "Địa chỉ email bắt buộc phải là chuỗi ký tự",
      })
      .email({
        message: "Địa chỉ email không hợp lệ",
      })
      .nullish(),
    fullName: z
      .string({
        required_error: "Họ tên người dùng là trường bắt buộc phải điền",
        invalid_type_error: "Họ tên người dùng bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài tối thiểu của họ tên người dùng là 6 ký tự")
      .nullish(),
  }),
  resetPasswordSchema: z
    .object({
      password: z
        .string({
          required_error: "Mật khẩu là trường bắt buộc phải điền",
          invalid_type_error: "Mật khẩu bắt buộc phải là chuỗi ký tự",
        })
        .min(6, "Độ dài tối thiểu của mật khẩu là 6 ký tự"),
      newPassword: z
        .string({
          required_error: "Mật khẩu mới là trường bắt buộc phải điền",
          invalid_type_error: "Mật khẩu mới bắt buộc phải là chuỗi ký tự",
        })
        .min(6, "Độ dài tối thiểu của mật khẩu mới là 6 ký tự"),
      newPasswordConfirmed: z.string({
        required_error: "Xác nhận mật khẩu mới là trường bắt buộc phải điền",
        invalid_type_error:
          "Xác nhận mật khẩu mới bắt buộc phải là chuỗi ký tự",
      }),
    })
    .superRefine(({ newPassword, newPasswordConfirmed }, ctx) => {
      if (newPassword !== newPasswordConfirmed) {
        ctx.addIssue({
          message: "Xác nhận mật khẩu mới không khớp với mật khẩu mới",
          path: ["newPasswordConfirmed"],
        });
      }
    }),

  editUserSchema: z.object({
    email: z
      .string({
        required_error: "Địa chỉ email là trường bắt buộc phải điền",
        invalid_type_error: "Địa chỉ email bắt buộc phải là chuỗi ký tự",
      })
      .email({
        message: "Địa chỉ email không hợp lệ",
      })
      .nullish(),
    department: z
      .nativeEnum(Department, {
        message: "Khoa công tác của người dùng không hợp lệ",
      })
      .nullish(),
    role: z
      .nativeEnum(Role, {
        message: "Vai trò của người dùng không hợp lệ",
      })
      .nullish(),
  }),
};
module.exports = userSchema;
