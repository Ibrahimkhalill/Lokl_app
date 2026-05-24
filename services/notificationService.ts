import { api } from "../lib/api";

export const notificationService = {
  getNotifications() {
    return api.get("/notifications/me/");
  },

  markAllRead() {
    return api.post("/notifications/me/read-all/");
  },
};
