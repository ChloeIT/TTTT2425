import { z } from "zod";
import { departmentEnum, userRoleEnum } from "./user.schema";

export const authSchema = {
  registerSchema: z.object({
    username: z
      .string({
        required_error: "Username là trường bắt buộc phải điền",
        invalid_type_error: "Username bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài của username ít nhất 6 ký tự")
      .max(20, "Độ dài của username tối đa 20 ký tự"),
    email: z
      .string({
        required_error: "Địa chỉ email là trường bắt buộc phải điền",
        invalid_type_error: "Địa chỉ email bắt buộc phải là chuỗi ký tự",
      })
      .email({
        message: "Địa chỉ email không hợp lệ",
      }),
    password: z
      .string({
        required_error: "Mật khẩu là trường bắt buộc phải điền",
        invalid_type_error: "Mật khẩu bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài tối thiểu của mật khẩu là 6 ký tự"),
    fullName: z
      .string({
        required_error: "Họ tên người dùng là trường bắt buộc phải điền",
        invalid_type_error: "Họ tên người dùng bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài tối thiểu của họ tên người dùng là 6 ký tự"),
    department: z
      .enum(departmentEnum, {
        message: "Tên khoa không hợp lệ",
      })
      .nullish(),
    role: z
      .enum(userRoleEnum, {
        message: "Vai trò của người dùng không hợp lệ",
      })
      .nullish(),
  }),

  loginSchema: z.object({
    // Có thể dùng email hoặc user để đăng nhập
    username: z
      .string({
        required_error: "Tài khoản là trường bắt buộc phải điền",
        invalid_type_error: "Tài khoản bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài của tài khoản ít nhất 6 ký tự"),
    password: z
      .string({
        required_error: "Mật khẩu là trường bắt buộc phải điền",
        invalid_type_error: "Mật khẩu bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài tối thiểu của mật khẩu là 6 ký tự"),
  }),
  getForgotPasswordOtpSchema: z.object({
    email: z
      .string({
        required_error: "Địa chỉ email là trường bắt buộc phải điền",
        invalid_type_error: "Địa chỉ email bắt buộc phải là chuỗi ký tự",
      })
      .email({
        message: "Địa chỉ email không hợp lệ",
      }),
  }),
  verifyForgotPasswordSchema: z
    .object({
      otp: z
        .string({
          required_error: "Mã otp là trường bắt buộc phải điền",
        })
        .refine((value) => value.length === 6, "Mã otp gồm có 6 số"),
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
};
