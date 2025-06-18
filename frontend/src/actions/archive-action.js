"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
const {
  default: instanceAPI,
  successResponse,
  errorResponse,
} = require("@/lib/axios");

export const getExams = async ({
  page = 1,
  query = "",
  department = "",
  month = "",
  year = "",
}) => {
  try {
    const res = await instanceAPI.get("/exams/archive", {
      params: {
        page,
        query,
        department,
        month,
        year,
      },
    });

    return {
      data: res.data.data,
      totalPage: res.data.totalPage,
    };
  } catch (error) {
    return {
      data: [],
      totalPage: 0,
    };
  }
};

export const getFile = async (examId) => {
  try {
    const res = await instanceAPI.get(`/exams/${examId}/files`);
    console.log(res.data.data);
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

export const uploadExamDocument = async (examId, formData) => {
  try {
    const res = await instanceAPI.patch(`/exams/${examId}/document`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    revalidatePath("/home/archive");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};

export const deleteExamDocument = async (examId) => {
  try {
    const res = await instanceAPI.delete(`/exams/${examId}/document`);
    revalidatePath("/home/archive");
    return {
      ok: true,
      success: true,
      message: res.data.message || "Đã xóa tài liệu của đề thi thành công",
    };
  } catch (error) {
    console.error(
      "Lỗi khi gọi deleteExamDocument:",
      error?.response?.data || error.message
    );
    return {
      ok: false,
      message:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Không thể xóa tài liệu. Vui lòng thử lại sau.",
    };
  }
};
