import { z } from "zod";

// export const signatureSchema = z.object({
//   file: z
//     .any()
//     .refine((file) => file instanceof File, {
//       message: "Vui lòng chọn file ảnh",
//     })
//     .refine((file) => file?.type?.startsWith("image/"), {
//       message: "Vui lòng chọn file ảnh hợp lệ",
//     }),
//   password: z
//     .string({
//       required_error: "Vui lòng nhập password",
//       invalid_type_error: "Password phải là chuỗi ký tự",
//     })
//     .min(6, "Password phải có ít nhất 6 ký tự"),
// });

// export const signExamSchema = z.object({
//   pdfUrl: z.string({
//     required_error: "Vui lòng cung cấp đường dẫn PDF",
//     invalid_type_error: "pdfUrl phải là chuỗi ký tự",
//   }),
//   exam_id: z.number({
//     required_error: "Vui lòng cung cấp exam_id",
//     invalid_type_error: "exam_id phải là số",
//   }),
//   fileType: z.enum(["question", "answer"], {
//     required_error: "Vui lòng chọn loại file",
//     invalid_type_error: "fileType không hợp lệ",
//   }),
// });

export const approveExamSchema = z.object({
  password: z
    .string({
      required_error: "Vui lòng nhập mật khẩu",
      invalid_type_error: "Mật khẩu phải là chuỗi ký tự",
    })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
export const rejectExamSchema = z.object({
  message: z
    .string({
      required_error: "Vui lòng nhập lý do từ chối",
      invalid_type_error: "Lý do phải là chuỗi ký tự",
    })
    .min(1, "Vui lòng nhập lý do từ chối"),
});
