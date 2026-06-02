// services/userService.ts
import { api } from "../lib/api";

export const settingService = {

  getOwnProfile() {
    return api.get("/settings/profile/");
  },
  

  updateProfile(data: FormData) {
    return api.patch("/users/me/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword(data: { current: string; newPass: string; confirm: string }) {
    return api.post("/settings/change-password/", data);
  },
  

  deleteAccount() {
    return api.delete("/settings/delete-account/");
  },

  getPrivacy() {
    return api.get("/settings/privacy/");
  },

  updatePrivacy(data: {
    profile_visibility?: "public" | "followers" | "private";
    location_sharing?: boolean;
    activity_status?: boolean;
  }) {
    return api.patch("/settings/privacy/", data);
  },

  getNotifications() {
    return api.get("/settings/notifications/");
  },

  updateNotifications(data: {
    push_notifications?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
  }) {
    return api.patch("/settings/notifications/", data);
  },
};