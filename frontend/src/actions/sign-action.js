"use server";

import { cookies } from "next/headers";
import instanceAPI from "@/lib/axios";

export const getExams = async ({ page = 1, query }) => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const res = await instanceAPI.get("/exams/all", {
      params: { page, query },
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      data: res.data.data || [],
      totalPage: res.data.totalPage || 1,
    };
  } catch (error) {
    console.error(
      "Lỗi khi gọi API lấy đề thi:",
      error?.response?.data || error
    );
    return {
      data: [],
      totalPage: 0,
    };
  }
};

export const ApprovedExamsList = async ({ page = 1, query }) => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const res = await instanceAPI.get("/exams", {
      params: { page, query },
      headers: { Authorization: `Bearer ${token}` },
    });

    const allExams = res.data.data || [];
    const approvedExams = allExams.filter((exam) => exam.status === "DA_DUYET");

    return {
      data: approvedExams,
      totalPage: res.data.totalPage || 1,
    };
  } catch (error) {
    console.error(
      "Lỗi khi gọi API lấy đề thi:",
      error?.response?.data || error
    );
    return {
      data: [],
      totalPage: 0,
    };
  }
};

export const uploadSignature = async (file, password) => {
  try {
    if (!file) {
      return { ok: false, message: "File chữ ký không được để trống" };
    }
    if (!password) {
      return { ok: false, message: "Password là bắt buộc" };
    }

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { ok: false, message: "Không tìm thấy token xác thực" };
    }

    // Tạo FormData
    const formData = new FormData();
    formData.append("signatureImage", file);
    formData.append("password", password);

    const res = await instanceAPI.post("/sign/uploadsignature", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return { ok: true, ...res.data };
  } catch (error) {
    console.error("Lỗi upload chữ ký:", error?.response?.data || error.message);
    return {
      ok: false,
      message:
        error.response?.data?.error || error.message || "Lỗi upload chữ ký",
    };
  }
};

export const signDocument = async ({ pdfUrl, exam_id, fileType }) => {
  try {
    const payload = { pdfUrl, exam_id, fileType };
    console.log("Sending payload to sign_exam:", payload);

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const res = await instanceAPI.post("/sign/signdocument", payload, {
      timeout: 12000,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  
    if (res.data.success) {
      console.log("Ký thành công:", res.data.message);
      return res.data;
    } else {
      console.error("Lỗi server trả về:", res.data.message);
      throw new Error(res.data.message);
    }
  } catch (error) {
    console.error(
      "Lỗi gọi API signDocument:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const approveExam = async (examId, password) => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { ok: false, message: "Không tìm thấy token xác thực" };
    }
    const res = await instanceAPI.patch(
      `/exams/${examId}/approve`,
      { password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
