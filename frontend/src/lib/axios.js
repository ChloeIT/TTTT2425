import { cookies } from "next/headers";

const { default: axios } = require("axios");

const instanceAPI = axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 10000,
  transformResponse: [
    function (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    },
  ],
  withCredentials: true,
});
instanceAPI.interceptors.request.use(
  async function (config) {
    const cookieStore = await cookies();

    const token = cookieStore.get("token");
    const deviceId = cookieStore.has("deviceId")
      ? `${cookieStore.get("deviceId").name}=${
          cookieStore.get("deviceId").value
        }`
      : "";

    return {
      ...config,
      headers: {
        ...(token?.value && {
          Authorization: `Bearer ${token.value}`,
        }),
        Cookie: deviceId,
      },
    };
  },
  function (error) {
    return Promise.reject(error);
  }
);

export const successResponse = (res) => {
  return {
    ok: true,
    status: res.status,
    ...res.data,
  };
};
export const errorResponse = (error) => {
  if (error.code === "ECONNABORTED") {
    return {
      ok: false,
      status: 500,
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    };
  }

  return {
    ok: false,
    status: error?.response?.status || 500,
    message:
      error?.response?.data?.error ||
      error?.response?.data?.message || // thêm nếu backend trả `message`
      error?.message ||
      "Lỗi hệ thống, vui lòng thử lại sau",
  };
};

export default instanceAPI;
