import { z } from "zod";

export const userRoleEnum = [
  "BAN_GIAM_HIEU",
  "TRUONG_KHOA",
  "GIANG_VIEN_RA_DE",
  "THU_KY",
  "USER",
];
export const departmentEnum = [
  "LY_LUAN_CO_SO",
  "XAY_DUNG_DANG",
  "NHA_NUOC_PHAP_LUAT",
  "MAC_DINH",
];
export const userDepartment = {
  LY_LUAN_CO_SO: "Lý luận cơ sở",
  XAY_DUNG_DANG: "Xây dựng đảng",
  NHA_NUOC_PHAP_LUAT: "Nhà nước pháp luật",
  MAC_DINH: "Mặc định",
};
export const userRole = {
  BAN_GIAM_HIEU: "Ban giám hiệu",
  TRUONG_KHOA: "Trưởng khoa",
  GIANG_VIEN_RA_DE: "Giảng viên ra đề",
  THU_KY: "Thư ký",
  USER: "Giảng viên",
};
export const userSchema = {
  registerSchema: z.object({
    username: z
      .string({
        required_error: "username là trường bắt buộc phải điền",
        invalid_type_error: "username bắt buộc phải là chuỗi ký tự",
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
    username: z
      .string({
        required_error: "username là trường bắt buộc phải điền",
        invalid_type_error: "username bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài của username ít nhất 6 ký tự")
      .max(20, "Độ dài của username tối đa 20 ký tự"),
    password: z
      .string({
        required_error: "Mật khẩu là trường bắt buộc phải điền",
        invalid_type_error: "Mật khẩu bắt buộc phải là chuỗi ký tự",
      })
      .min(6, "Độ dài tối thiểu của mật khẩu là 6 ký tự"),
  }),
  editRoleSchema: z.object({
    role: z.enum(userRoleEnum, {
      message: "Vai trò của người dùng không hợp lệ",
    }),
  }),
  updateSchema: z.object({
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
  editDepartmentSchema: z.object({
    department: z.enum(departmentEnum, {
      message: "Khoa công tác của người dùng không hợp lệ",
    }),
  }),
};
