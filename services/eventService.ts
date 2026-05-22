import { api } from "../lib/api";

export const eventService = {
  listEvents(params?: { event_type?: string; search?: string }) {
    return api.get("/events/", { params });
  },
  
 

  getEvent(id: number) {
    return api.get(`/events/${id}/`);
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

  listSocialGroups() {
    return api.get("/groups/");
  },

  createSocialGroup(form: FormData) {
    return api.post("/groups/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getSocialGroup(id: number) {
    return api.get(`/groups/${id}/`);
  },

  getGroupMembers(id: number) {
    return api.get(`/groups/${id}/members/`);
  },

  joinSocialGroup(id: number) {
    return api.post(`/groups/${id}/join/`);
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
