import { api } from "../lib/api";

export const eventService = {
  listEvents(params?: { event_type?: string; search?: string }) {
    return api.get("/events/", { params });
  },
  
 

  getEvent(id: number) {
    return api.get(`/events/${id}/`);
  },

  updateEvent(id: number, data: Record<string, unknown>) {
    return api.patch(`/events/${id}/`, data);
  },

  cancelEvent(id: number) {
    return api.post(`/events/${id}/cancel/`);
  },

  registerForEvent(id: number) {
    return api.post(`/events/${id}/register/`);
  },

  cancelRegistration(id: number) {
    return api.delete(`/events/${id}/register/`);
  },

  getReviews(id: number) {
    return api.get(`/events/${id}/reviews/`);
  },

  postReview(id: number, data: { rating: number; comment: string }) {
    return api.post(`/events/${id}/reviews/`, data);
  },

  getGallery(id: number) {
    return api.get(`/events/${id}/gallery/`);
  },

  getFriends(id: number) {
    return api.get(`/events/${id}/friends/`);
  },

  getGroups(id: number) {
    return api.get(`/events/${id}/groups/`);
  },

  createGroup(id: number, data: { name: string; description?: string }) {
    return api.post(`/events/${id}/groups/`, data);
  },

  joinGroup(eventId: number, groupId: number) {
    return api.post(`/events/${eventId}/groups/${groupId}/join/`);
  },

  getShareLink(id: number) {
    return api.get(`/events/${id}/share-link/`);
  },

  // ── Private event join request flow ───────────────────────────────────────
  /** User submits a request to join a private event */
  requestToJoinEvent(id: number, message?: string) {
    return api.post(`/events/${id}/join-request/`, { message: message ?? "" });
  },
  /** Host lists all join requests for their event */
  getJoinRequests(id: number) {
    return api.get(`/events/${id}/join-requests/`);
  },
  /** Host approves or declines a specific request */
  respondToJoinRequest(
    eventId: number,
    requestId: number,
    status: "Approved" | "Declined"
  ) {
    return api.patch(`/events/${eventId}/join-requests/${requestId}/`, { status });
  },

  listSocialGroups() {
    return api.get("/groups/");
  },

  getMyGroupInvites() {
    return api.get("/groups/invites/");
  },

  respondGroupInvite(inviteId: number, accept: boolean) {
    return api.post(`/groups/invites/${inviteId}/respond/`, { accept });
  },

  inviteToGroup(groupId: number, userIds: number[]) {
    return api.post(`/groups/${groupId}/invite/`, { user_ids: userIds });
  },

  getMyGroups() {
    return api.get("/groups/", { params: { member: "me" } });
  },

  createSocialGroup(form: FormData) {
    return api.post("/groups/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getSocialGroup(id: number) {
    return api.get(`/groups/${id}/`);
  },
  

   getSocialGroupPost(id: number) {
    return api.get(`/groups/${id}/posts/`);
  },

  getGroupMembers(id: number) {
    return api.get(`/groups/${id}/members/`);
  },

  joinSocialGroup(id: number) {
    return api.post(`/groups/${id}/join/`);
  },

  leaveSocialGroup(id: number) {
    return api.delete(`/groups/${id}/join/`);
  },

  updateGroup(id: number, data: { name?: string; bio?: string; is_private?: boolean; max_members?: number | null }) {
    return api.patch(`/groups/${id}/`, data);
  },

  uploadGroupCover(id: number, form: FormData) {
    return api.patch(`/groups/${id}/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadGroupPhoto(id: number, form: FormData) {
    return api.patch(`/groups/${id}/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
