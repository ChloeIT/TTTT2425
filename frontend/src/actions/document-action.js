"use server";

import { cookies } from "next/headers";
import instanceAPI from "@/lib/axios";

export const getSignedDocumentFile = async (documentId) => {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, message: "Chưa đăng nhập." };
  }

  try {
    const res = await instanceAPI.get(`/api/documents/${documentId}/signed`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Lỗi khi gọi API lấy file:", err);
    return { success: false, message: "Lỗi khi lấy file." };
  }
};

export const getAllDocumentsWithExam = async () => {
  try {
    const res = await instanceAPI.get("/documents");

    return {
      data: res.data.data || [],
    };
  } catch (error) {
    console.error("Lỗi khi lấy documents:", error?.response?.data || error);
    return {
      data: [],
    };
  }
};
export const getExamsWithDocuments = async ({ page, query }) => {
   
  const res = await instanceAPI.get("/documents", {
    params: {
      page,
      query,
    },
    
  });
    

  const result = res.data;
  if (!result || !result.data) {
    return { data: [], totalPage: 1 };
  }

  return {
    data: result.data,
    totalPage: result.totalPage ?? 1, // fallback nếu server không trả totalPage
  };
};

