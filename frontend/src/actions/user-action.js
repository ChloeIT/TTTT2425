"use server";

import { revalidatePath } from "next/cache";

const {
  default: instanceAPI,
  successResponse,
  errorResponse,
} = require("@/lib/axios");

export const getUsers = async ({ page = 1, query, isActive }) => {
  try {
    const res = await instanceAPI.get("/users", {
      params: {
        page,
        query,
        isActive,
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

export const createUser = async (values) => {
  try {
    const res = await instanceAPI.post("/register", values);
    revalidatePath("/home/users");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};

export const editUser = async (userId, values) => {
  try {
    const res = await instanceAPI.patch(`/users/${userId}/edit`, values);
    revalidatePath("/home/users");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};

export const editProfile = async (values, pathname) => {
  try {
    const res = await instanceAPI.patch(`/users/editProfile`, values);
    revalidatePath(pathname);
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
export const resetUserPassword = async (values) => {
  try {
    const res = await instanceAPI.patch(`/users/resetPassword`, values);

    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
export const activeUser = async (userId, isActive) => {
  try {
    let res;
    if (isActive) {
      res = await instanceAPI.patch(`/users/${userId}/inactive`);
    } else {
      res = await instanceAPI.patch(`/users/${userId}/active`);
    }

    revalidatePath("/users");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
