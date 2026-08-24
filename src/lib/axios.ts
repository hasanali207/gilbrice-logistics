// path আপনারটা অনুযায়ী ঠিক করে নিন
import { logout } from "@/Redux/Features/Auth/authSlice";
import { store } from "@/Redux/store";

import axios from "axios";
import toast from "react-hot-toast";
// অথবা আপনি যেটা ব্যবহার করেন (react-hot-toast, react-toastify ইত্যাদি)

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API,
});

/* -------------------- REQUEST -------------------- */
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* -------------------- RESPONSE -------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    const isTokenExpired =
      status === 401 ||
      message?.toLowerCase()?.includes("jwt expired") ||
      message?.toLowerCase()?.includes("invalid token");

    if (isTokenExpired) {
      console.log("❌ API 401");
      console.log("URL:", error?.config?.url);
      console.log("Status:", status);
      console.log("Message:", message);
      console.log("Token:", store.getState().auth.token);

      store.dispatch(logout());

      toast.error("Session expired. Please login again.");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
