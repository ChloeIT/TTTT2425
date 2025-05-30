import { cookies } from "next/headers";

const { default: axios } = require("axios");

const instanceAPI = axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 3000,
  transformResponse: [
    function (data) {
      return JSON.parse(data);
    },
  ],
});
instanceAPI.interceptors.request.use(
  async function (config) {
    const cookieStore = await cookies();
    const hasToken = cookieStore.has("token");
    if (hasToken) {
      const token = cookieStore.get("token");
      return {
        ...config,
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      };
    }
    return config;
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
    status: error.status,
    message: error.response
      ? error.response?.data?.error
      : "Lỗi hệ thống, vui lòng thử lại sau",
  };
};

export default instanceAPI;
