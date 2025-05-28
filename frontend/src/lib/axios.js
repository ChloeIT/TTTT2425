const { default: axios } = require("axios");

const instanceAPI = axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 1000,
  withCredentials: true,
  transformResponse: [
    function (data) {
      return JSON.parse(data);
    },
  ],
});
export default instanceAPI;
