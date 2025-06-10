"use server";

import { cookies } from "next/headers";
import instanceAPI from "@/lib/axios";

export const getExams = async ({ page = 1, query }) => {
  try {
    // không cần thêm bearer đã config sẵn rồi
    const res = await instanceAPI.get("/exams/all", {
      params: { page, query },
    });

    return {
      data: res.data.data || [],
      totalPage: res.data.totalPage || 1,
    };
  } catch (error) {
   
    return {
      data: [],
      totalPage: 0,
    };
  }
};




// export const uploadSignature = async (file, password) => {
//   try {
//     if (!file) {
//       return { ok: false, message: "File chữ ký không được để trống" };
//     }
//     if (!password) {
//       return { ok: false, message: "Password là bắt buộc" };
//     }

//     // Tạo FormData
//     const formData = new FormData();
//     formData.append("signatureImage", file);
//     formData.append("password", password);

//     const res = await instanceAPI.post("/sign/uploadsignature", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     return { ok: true, ...res.data };
//   } catch (error) {
//     console.error("Lỗi upload chữ ký:", error?.response?.data || error.message);
//     return {
//       ok: false,
//       message:
//         error.response?.data?.error || error.message || "Lỗi upload chữ ký",
//     };
//   }
// };

// export const signDocument = async ({ pdfUrl, exam_id, fileType }) => {
//   try {
//     const payload = { pdfUrl, exam_id, fileType };
//     console.log("Sending payload to sign_exam:", payload);

//     const res = await instanceAPI.post("/sign/signdocument", payload, {
//       timeout: 12000,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (res.data.success) {
//       console.log("Ký thành công:", res.data.message);
//       return res.data;
//     } else {
//       console.error("Lỗi server trả về:", res.data.message);
//       throw new Error(res.data.message);
//     }
//   } catch (error) {
//     console.error(
//       "Lỗi gọi API signDocument:",
//       error?.response?.data || error.message
//     );
//     throw error;
//   }
// };

export const approveExam = async (examId, password) => {
  try {
    const res = await instanceAPI.patch(
      `/exams/${examId}/approve`,
      { password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      ok: true,
      success: true,
      data: res.data.data,
      message: "Duyệt đề thi thành công",
    };
  } catch (error) {
    console.error("Lỗi approveExam:", error?.response?.data || error.message);
    return {
      ok: false,
      message: error?.response?.data?.error || "Đã xảy ra lỗi khi duyệt đề thi",
    };
  }
};


export const rejectExam = async (examId, message) => {
  try {
    const res = await instanceAPI.patch(
      `/exams/${examId}/reject`,
      { message },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      ok: true,
      success: true,
      data: res.data.data,
      message: "Đã từ chối đề thi ",
    };
  } catch (error) {
    console.error("Lỗi rejectExam:", error?.response?.data || error.message);
    return {
      ok: false,
      message:
        error?.response?.data?.error || "Đã xảy ra lỗi khi từ chối đề thi",
    };
  }
};

export const getFile = async (examId) => {
  try {
    const res = await instanceAPI.get(`/exams/${examId}/files`);

    return {
      ok: true,
      success: true,
      data: res.data.data || [],
      message: "Lấy file thành công.",
    };
  } catch (error) {
    console.error(
      "Lỗi khi gọi getFile:",
      error?.response?.data || error.message
    );

    return {
      ok: false,
      message:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Không thể lấy file. Vui lòng thử lại sau.",
    };
  }
};




