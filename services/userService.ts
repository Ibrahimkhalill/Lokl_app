import { api } from "../lib/api";

export const userService = {
  getFriends() {
    return api.get("/users/friends/");
  },
};
