"use server";

import instanceAPI from "@/lib/axios";

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
