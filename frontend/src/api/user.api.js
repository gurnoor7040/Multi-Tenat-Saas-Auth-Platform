import { axiosClient } from "./axiosClient";

export const getMe = () => axiosClient.get("/user/me");

export const updateMe = (data) => axiosClient.patch("/user/me", data);

export const changePassword = (data) => axiosClient.post("/user/change-password", data);

export const getMyOrgs = () => axiosClient.get("/user/orgs");