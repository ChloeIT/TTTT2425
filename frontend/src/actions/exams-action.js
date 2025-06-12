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

export const ApprovedExamsList = async ({ page = 1, query }) => {
  try {
    const res = await instanceAPI.get("/exams/all", {
      params: { page, query },
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

export const getSignedExamFiles = async (examId) => {
  try {
    const res = await instanceAPI.get(`/exams/${examId}/files`);
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};

export const statusChanged = async (examId, changeStatus) => {
  try {
    const res = await instanceAPI.patch(
      `/exams/${examId}/changeStatus`,
      { changeStatus },
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
