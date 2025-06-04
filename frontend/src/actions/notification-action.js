"use server";

import instanceAPI, { errorResponse, successResponse } from "@/lib/axios";
import { revalidatePath } from "next/cache";

export const getNotifications = async ({ page = 1 }) => {
  try {
    const res = await instanceAPI.get("/notifications", {
      params: {
        page,
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

export const updateReadNotifications = async (ids) => {
  try {
    const res = await instanceAPI.post("/notifications/read", {
      ids,
    });

    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
