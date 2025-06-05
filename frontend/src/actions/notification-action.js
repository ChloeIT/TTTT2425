"use server";

import instanceAPI, { errorResponse, successResponse } from "@/lib/axios";

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
      haveNotReadCount: res.data.haveNotReadCount,
    };
  } catch (error) {
    return {
      data: [],
      totalPage: 0,
      haveNotReadCount: 0,
    };
  }
};

export const updateReadNotifications = async () => {
  try {
    const res = await instanceAPI.patch("/notifications/read");

    return successResponse(res);
  } catch (error) {
    return errorResponse(error);
  }
};
