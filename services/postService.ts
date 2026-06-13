import { api } from "../lib/api";

export const postService = {
  createPost(form: FormData) {
    return api.post("/posts/", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000, // 2 min — video uploads can be slow
    });
  },

  getFeed(page = 1, pageSize = 10) {
    return api.get("/posts/", { params: { page, page_size: pageSize } });
  },

  getGroupFeed(page = 1, pageSize = 10) {
    return api.get("/posts/", { params: { my_groups: true, page, page_size: pageSize } });
  },

  getFriendsFeed(page = 1, pageSize = 10) {
    return api.get("/posts/", { params: { feed: "friends", page, page_size: pageSize } });
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

  deletePost(id: number) {
    return api.delete(`/posts/${id}/`);
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

  getLikes(id: number) {
    return api.get(`/posts/${id}/likes/`);
  },

  getComments(id: number) {
    return api.get(`/posts/${id}/comments/`);
  },

  postComment(id: number, body: string, parentId?: number) {
    return api.post(`/posts/${id}/comments/`, {
      body,
      ...(parentId ? { parent_id: parentId } : {}),
    });
  },
};
