import { z } from "zod";

export const userSchema = {
  userRegistrationSchema: z.object({
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    department: z.string().min(1, "Vui lòng nhập phòng ban"),
    role: z.enum(
      [
        "USER",
        "GIANG_VIEN_RA_DE",
        "THU_KY",
        "TRUONG_KHOA",
        "BAN_GIAM_HIEU",
      ],
      {
        required_error: "Vui lòng chọn vai trò",
      }
    ),
  }),

  userLoginSchema: z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  }),
};
