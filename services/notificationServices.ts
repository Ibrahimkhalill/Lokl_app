import { api } from "../lib/api";

export const notificationService = {
  getNotifications() {
    return api.get("/notifications/");
  },
};
