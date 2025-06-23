"use server";

import instanceAPI from "@/lib/axios";
const { successResponse, errorResponse } = require("@/lib/axios");

export async function getSignedExams({
  page = 1,
  query = "",
  department,
  month,
  year,
} = {}) {
  try {
    const res = await instanceAPI.get("/secretary/signed-exam", {
      params: {
        page,
        query,
        department,
        month,
        year,
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
export async function getUserEmail() {
  try {
    const res = await instanceAPI.get("/secretary/getEmailUsers");
    console.log("Emails:", res.data.data);
    return res.data.data || [];
  } catch (error) {
    console.error("getEmailUsers error:", error);
    return [];
  }
}
export async function notifyUserByEmail(email, password, titleExam,type) {
  try {
    const res = await instanceAPI.post("/secretary/notify", {
      email,
      password,
      titleExam,
      type
    });
    return res.data;
  } catch (error) {
    console.error("notifyUserByEmail error:", error);
    throw error;
  }
}

//ds de da ky cho THU_KY
export async function getSignedExamsWithDocuments({
  page = 1,
  query = "",
  department = "",
  year = "",
  month = "",
} = {}) {
  try {
    const res = await instanceAPI.get("/secretary/documents", {
      params: {
        page,
        query,
        department,
        year,
        month,
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

export const getSignedExamFiles = async (examId) => {
  console.log("call");
  try {
    const res = await instanceAPI.get(`/secretary/${examId}/files`);
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
