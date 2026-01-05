// # 1️⃣ Import axios
import axios from "axios";
import BASE_URL from "./api";

// # 2️⃣ Set the Base URL
// BASE_URL
// # 3️⃣ Create axiosInstance with base URL and default headers
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// # 4️⃣ Request Interceptor: Automatically attach Bearer Token (if available)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); //# Retrieve token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // # Attach token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// // # 5️⃣ Response Interceptor: Handle API Errors Automatically
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error(
//       "API Error:",
//       error.response?.data?.message || error.message || "API request failed"
//     );

//     return Promise.reject({
//       status: error.response?.status || 500, // # Return status code
//       message:
//         error.response?.data?.message ||
//         error.message ||
//         "Something went wrong. Try again.",
//       errors: error.response?.data?.errors || null, // # Capture validation errors
//     });
//   }
// );

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const restrictedMessage = "Access restricted from your country.";

    // ✅ Check for restriction error
    // if (error.response?.data?.message === restrictedMessage) {
    //   window.location.href = "/restricted"; // 👈 This will open your Restrict page
    //   return; // Stop processing further
    // }

    if (error.response?.data?.message === restrictedMessage) {
      sessionStorage.setItem("restricted_redirect", "true"); // ✅ set flag
      window.location.href = "/restricted";
      return;
    }

    console.error(
      "API Error:",
      error.response?.data?.message || error.message || "API request failed"
    );

    return Promise.reject({
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Try again.",
      errors: error.response?.data?.errors || null,
    });
  }
);

// # 6️⃣ Export axiosInstance for global usage
export default axiosInstance;
