import axios from "axios";
import { tokenManager } from "../utils/tokenManager";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 5000,
  headers: {
    "Accept": "application/json"
  },
  withCredentials: true
});

// Add request logging in development
api.interceptors.request.use(
  (config) => {
    console.log('🔵 API Request:', config.method.toUpperCase(), config.url);

    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request');
    } else {
      console.warn('⚠️ No auth token found');
    }
    return config;
  },
  (error) => {
    console.error('🔴 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('🟢 API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('🔴 API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    // 401 handling - Token Expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops if refresh endpoint itself fails
      if (originalRequest.url.includes('/auth/refresh/')) {
        tokenManager.removeToken();
        window.location.href = '/sales-login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log("🔄 Attempting Token Refresh...");
        // Use a fresh axios instance to avoid interceptors
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/refresh/`,
          {},
          { withCredentials: true } // Rely on HttpOnly cookie if available
        );

        const newToken = response.data.token || response.data.access;

        if (newToken) {
          console.log("✅ Token Refreshed Successfully");
          tokenManager.setToken(newToken);

          // Update the failed request's header and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Token Refresh Failed:", refreshError);
        // If refresh fails, we MUST force logout to prevent "Billed By Staff" (Cookie Fallback) issues
        tokenManager.removeToken();
        localStorage.removeItem("user"); // Clear user dat too
        window.location.href = '/sales-login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
