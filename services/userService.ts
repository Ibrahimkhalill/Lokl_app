// services/userService.ts
import { api } from "../lib/api";

export const userService = {
  getFriends() {
    return api.get("/users/friends/");
  },
  
  getUserProfile(userId: number) {
    return api.get(`/users/${userId}/profile/`);
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

  getLeaderboard() {
    return api.get("/leaderboard/");
  },

  updateLocation(payload: { latitude: number; longitude: number; location_name: string }) {
    return api.patch("/users/location/", payload);
  },
};