"use server";

import instanceAPI from "@/lib/axios";

export async function getPasswords({ page = 1, query = "" } = {}) {
  try {

   
    const res = await instanceAPI.get("/secretary/allExams", {
      params: { page, query },
    });

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
export async function notifyUserByEmail(email, password,titleExam) {
  try {
    const res = await instanceAPI.post("/secretary/notify", {
      email,
      password,
      titleExam
    });
    return res.data;
  } catch (error) {
    console.error("notifyUserByEmail error:", error);
    throw error;
  }
}