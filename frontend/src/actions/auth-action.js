"use server";

import { createSession, deleteSession } from "@/lib/session";

const { default: instanceAPI } = require("@/lib/axios");

export const login = async (values) => {
  try {
    const res = await instanceAPI.post("/login", values);
    await createSession(res.data.data.session.token);

    return {
      ok: true,
      ...res.data,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.response
        ? error.response.data.error
        : "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};
export const logout = async () => {
  try {
    const res = await instanceAPI.get("/logout");
    await deleteSession();
    return {
      ok: true,
      ...res.data,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.response
        ? error.response.data.error
        : "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};
export const currentUser = async () => {
  try {
    const res = await instanceAPI.get("/currentUser");
    return {
      ok: true,
      ...res.data,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.response
        ? error.response.data.error
        : "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }
};
