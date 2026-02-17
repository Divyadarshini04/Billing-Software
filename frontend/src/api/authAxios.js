import axios from "axios";
import { tokenManager } from "../utils/tokenManager";

// Separate axios instance for authentication backend
const authApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: false
});

// Add request logging
authApi.interceptors.request.use(
  (config) => {

    const token = tokenManager.getToken();

    if (token) {
      console.log(`DEBUG: authAxios using authToken. Path: ${config.url}. Token starts with: ${token.substring(0, 20)}...`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`DEBUG: authAxios - No token found for path: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error(`🔴 Auth Request Error [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`, error);
    if (error.response?.status === 403) {
      console.error("403 Forbidden Details:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url;
    console.error(`🔴 API Error ${error.response?.status} on ${url}:`, error.response?.data);

    if (error.response?.status === 401) {
      console.error(`⚠️ [authAxios] 401 detected on ${url}. Wiping tokens!`);
      // localStorage.removeItem("authToken");
      // localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default authApi;
