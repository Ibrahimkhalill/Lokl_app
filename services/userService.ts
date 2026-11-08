// services/userService.ts
import { api } from "../lib/api";

export const userService = {
  getFriends() {
    return api.get("/users/friends/");
  },
  
  getUserProfile(userId: number) {
    return api.get(`/users/${userId}/profile/`);
  },


  getFollowRequests() {
    return api.get("/users/follow-requests/");
  },

  respondFollowRequest(requestId: number, accept: boolean) {
    return api.post(`/users/follow-requests/${requestId}/respond/`, { accept });
  },

  getMe() {
    return api.get("/users/me/");
  },

  getStreaks() {
    return api.get("/streaks/");
  },

  getAchievements() {
    return api.get("/achievements/");
  },

  getLeaderboard(mode?: "all" | "friends") {
    return api.get("/leaderboard/", { params: mode === "friends" ? { mode: "friends" } : undefined });
  },

  updateLocation(payload: { latitude: number; longitude: number; location_name: string }) {
    return api.patch("/users/location/", payload);
  },
};