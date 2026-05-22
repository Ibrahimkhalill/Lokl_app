import { api } from "../lib/api";

export const postService = {
  getFeed(page = 1) {
    return api.get("/posts/", { params: { page } });
  },

  getFeedByUrl(url: string) {
    return api.get(url);
  },

  getGroups() {
    return api.get("/groups/");
  },

  likePost(id: number) {
    return api.post(`/posts/${id}/like/`);
  },

  savePost(id: number) {
    return api.post(`/posts/${id}/save/`);
  },

  sharePost(id: number) {
    return api.post(`/posts/${id}/share/`);
  },

  followUser(id: number) {
    return api.post(`/users/${id}/follow/`);
  },

  unfollowUser(id: number) {
    return api.delete(`/users/${id}/follow/`);
  },
};
