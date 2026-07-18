import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive httpOnly cookies (access/refresh tokens)
});

// Reads the non-httpOnly CSRF cookie (set by the backend on every request,
// see backend/src/middleware/csrf.js) and echoes it in the header the
// backend's verifyCsrf middleware checks against.
function getCsrfTokenFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

axiosClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken && ["post", "patch", "delete", "put"].includes(config.method)) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

// On a 401 (expired access token), silently call /auth/refresh once and
// retry the original request — the refresh endpoint rotates cookies
// automatically, so the caller never has to know a refresh happened.
// A second 401 in a row means the refresh token itself is invalid/expired,
// so we let that one propagate (caller should redirect to /login).
let isRefreshing = false;
let refreshQueue = [];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue concurrent requests behind the in-flight refresh instead of
      // firing multiple parallel refresh calls (each rotates the token,
      // which would invalidate the others).
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => axiosClient(originalRequest));
    }

    isRefreshing = true;
    try {
      await axiosClient.post("/auth/refresh");
      refreshQueue.forEach(({ resolve }) => resolve());
      refreshQueue = [];
      return axiosClient(originalRequest);
    } catch (refreshError) {
      refreshQueue.forEach(({ reject }) => reject(refreshError));
      refreshQueue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);