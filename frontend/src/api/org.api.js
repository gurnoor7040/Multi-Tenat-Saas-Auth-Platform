import { axiosClient } from "./axiosClient";

export const createOrg = (name) => axiosClient.post("/org/create", { name });

export const getOrg = (slug) => axiosClient.get(`/org/${slug}`);

export const updateOrg = (slug, data) => axiosClient.patch(`/org/${slug}`, data);

export const deleteOrg = (slug) => axiosClient.delete(`/org/${slug}`);

export const listMembers = (slug) => axiosClient.get(`/org/${slug}/members`);

export const changeMemberRole = (slug, userId, role) =>
  axiosClient.patch(`/org/${slug}/members/${userId}/role`, { role });

export const removeMember = (slug, userId) =>
  axiosClient.delete(`/org/${slug}/members/${userId}`);