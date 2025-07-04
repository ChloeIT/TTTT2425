"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
    revalidatePath("/home/examsUpload");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};

export const getPendingExams = async ({ query = "" } = {}) => {
  try {
    const res = await instanceAPI.get("/exams/pending", {
      params: { query },
    });
    return {
      ok: true,
      data: res.data.data || [],
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { ok: false, unauthenticated: true };
    }
    return {
      ok: false,
      message:
        error.response?.data?.error ||
        "Lỗi hệ thống, không thể lấy danh sách đề thi đang chờ",
    };
  }
};

export const getRejectedExams = async ({ query = "" } = {}) => {
  try {
    const res = await instanceAPI.get("/exams/rejected", {
      params: { query },
    });
    return {
      ok: true,
      data: res.data.data || [],
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { ok: false, unauthenticated: true };
    }
    return {
      ok: false,
      message:
        error.response?.data?.error ||
        "Lỗi hệ thống, không thể lấy danh sách đề thi bị từ chối",
    };
  }
};

//lấy ds đề trưởng khoa
export async function getExamsWithDeanRole({ page = 1, query = "" } = {}) {
  try {
    const res = await instanceAPI.get("/exams/truongkhoa/ds", {
      params: {
        page,
        query,
      },
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
}
//UI đè thi BGH
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

//UI đề thi người gác
export const approvedFull = async ({ page = 1, query, status }) => {
  try {
    const res = await instanceAPI.get("/exams/approved", {
      params: { page, query, status },
    });

    return {
      data: res.data.data,
      totalPage: res.data.totalPage,
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
    const cookie = await cookies();
    const token = cookie.get("token")?.value;
    const res = await instanceAPI.get(`/exams/${examId}/files`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
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
      message: "Đề thi mở thành công",
    };
  } catch (error) {
    console.error("Lỗi approveExam:", error?.response?.data || error.message);
    return {
      ok: false,
      message: error?.response?.data?.error || "Đã xảy ra lỗi khi duyệt đề thi",
    };
  }
};

export const openExam = async (examId, password) => {
  try {
    const cookie = await cookies();
    const token = cookie.get("token")?.value;
    const res = await instanceAPI.patch(
      `/exams/${examId}/open`,
      { password },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      ok: true,
      success: true,
      data: res.data.data,
      message: "Đề thi mở thành công",
    };
  } catch (error) {
    console.error("Lỗi approveExam:", error?.response?.data || error.message);
    return {
      ok: false,
      message: error?.response?.data?.error || "Đã xảy ra lỗi khi duyệt đề thi",
    };
  }
};

export const deleteExam = async (examId) => {
  try {
    const res = await instanceAPI.delete(`/exams/${examId}`);
    revalidatePath("/home/examsUpload");
    return {
      ok: true,
      message: res.data.message || "Đã xóa đề thi thành công",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.error || "Lỗi hệ thống, không thể xóa đề thi",
    };
  }
};
