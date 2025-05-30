"use server";

import { revalidatePath } from "next/cache";

const {
  default: instanceAPI,
  successResponse,
  errorResponse,
} = require("@/lib/axios");

export const createUser = async (values) => {
  try {
    const res = await instanceAPI.post("/register", values);
    revalidatePath("/users");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};

export const getUsers = async ({ page = 1, query }) => {
  try {
    const res = await instanceAPI.get("/users", {
      params: {
        page,
        query,
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

export const editUserRole = async (userId, values) => {
  try {
    const res = await instanceAPI.patch(`/users/${userId}/editRole`, values);
    revalidatePath("/users");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
export const editUserDepartment = async (userId, values) => {
  try {
    const res = await instanceAPI.patch(
      `/users/${userId}/editDepartment`,
      values
    );
    revalidatePath("/users");
    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
export const editCurrentUser = async (values, path) => {
  try {
    const res = await instanceAPI.patch(`/users/edit`, values);

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
