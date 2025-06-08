"use server";

import instanceAPI from "@/lib/axios";

export async function getPasswords({ page = 1, query = "" } = {}) {
  try {
    console.log("gọi");

   
    const res = await instanceAPI.get("/secretary/allExams", {
      params: { page, query },
    });

    console.log(res.data);
    return {
      data: res.data.data || [],
      totalPage: res.data.totalPage || 1,
    };
  } catch (error) {
    console.error("getPasswords error:", error);
    return {
      data: [],
      totalPage: 1,
    };
  }
}
