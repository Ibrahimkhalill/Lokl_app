import { api } from "../lib/api";

export type ReportTarget = { postId?: number; userId?: number };

export const safetyService = {
  /** Report a post (`postId`) or a person (`userId`). Reviewed from the admin dashboard. */
  report(target: ReportTarget, reason: string, details?: string) {
    return api.post("/reports/", {
      ...(target.postId ? { linked_post: target.postId } : { reported_user: target.userId }),
      report_reason: reason,
      content: details ?? "",
    });
  },

  block(userId: number) {
    return api.post(`/users/${userId}/block/`);
  },

  unblock(userId: number) {
    return api.delete(`/users/${userId}/block/`);
  },

  getBlocked() {
    return api.get("/users/blocked/");
  },
};
