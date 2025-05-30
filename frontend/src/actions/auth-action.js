"use server";

import { createSession, deleteSession } from "@/lib/session";

const {
  default: instanceAPI,
  successResponse,
  errorResponse,
} = require("@/lib/axios");

export const login = async (values) => {
  try {
    const res = await instanceAPI.post("/login", values);
    await createSession(res.data.data?.session?.token);

    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
export const logout = async () => {
  try {
    const res = await instanceAPI.get("/logout");
    await deleteSession();
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
export const currentUser = async () => {
  try {
    const res = await instanceAPI.get("/currentUser");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
