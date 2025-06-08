"use server";

const {
  default: instanceAPI,
  successResponse,
  errorResponse,
} = require("@/lib/axios");

export const createExam = async (formData) => {
  try {
    const res = await instanceAPI.post("/exams", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};

export const getExams = async () => {
  try {
    const res = await instanceAPI.get("/exams");
    return {
      ok: true,
      data: res.data.data,
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { ok: false, unauthenticated: true };
    }
    return {
      ok: false,
      message:
        error.response?.data?.error ||
        "Lỗi hệ thống, không thể lấy danh sách đề thi",
    };
  }
};

export const getSignedExamFiles = async (examId) => {
  try {
    const res = await instanceAPI.get(`/exams/${examId}/files`);
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
