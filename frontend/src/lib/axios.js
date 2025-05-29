import { cookies } from "next/headers";

const { default: axios } = require("axios");

const instanceAPI = axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 1000,
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
instanceAPI.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    return Promise.reject(error);
  }
);
export default instanceAPI;
