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

  updateInterests(sports_interests: string[]) {
    return api.patch("/users/me/", { sports_interests });
  },

  getNotifications() {
    return api.get("/settings/notifications/");
  },

  updateNotifications(data: {
    push_notifications?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    notify_friend_ranking?: boolean;
    notify_post_likes?: boolean;
    notify_post_comments?: boolean;
    notify_friend_joins_event?: boolean;
    notify_event_reminders?: boolean;
    notify_new_venues?: boolean;
  }) {
    return api.patch("/settings/notifications/", data);
  },
};