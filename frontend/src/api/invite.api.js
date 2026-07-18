import { axiosClient } from "./axiosClient";

export const createInvite = (slug, data) => axiosClient.post(`/org/${slug}/invite`, data);

export const listInvites = (slug) => axiosClient.get(`/org/${slug}/invites`);

export const revokeInvite = (slug, inviteId) =>
  axiosClient.delete(`/org/${slug}/invites/${inviteId}`);

export const acceptInvite = (token) => axiosClient.post(`/invite/${token}/accept`);