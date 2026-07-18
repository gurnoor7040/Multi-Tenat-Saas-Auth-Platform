import { axiosClient } from "./axiosClient";

export const registerUser = (data) => axiosClient.post("/auth/register", data);

export const verifyEmail = (token) => axiosClient.get(`/auth/verify-email/${token}`);

export const loginUser = (data) => axiosClient.post("/auth/login", data);

export const logoutUser = () => axiosClient.post("/auth/logout");

export const forgotPassword = (email) =>
  axiosClient.post("/auth/forgot-password", { email });

export const resetPassword = (data) => axiosClient.post("/auth/reset-password", data);

// Google/GitHub OAuth are full-page redirects (not fetch calls) — the
// backend route itself kicks off the provider handshake.
export const googleOAuthUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/google`;
export const githubOAuthUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/github`;