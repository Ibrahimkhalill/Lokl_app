import type { Router } from "expo-router";

type ShareablePost = {
  id: number;
  image_url?: string | null;
  body?: string | null;
  location?: string | null;
};

/** Opens the share sheet screen for a post (that screen records the share with the API). */
export function openPostShare(router: Router, id: number, post?: ShareablePost | null) {
  const params = new URLSearchParams({ postId: String(id) });
  if (post?.image_url) params.set("imageUrl", post.image_url);
  if (post?.body) params.set("title", post.body.slice(0, 80));
  if (post?.location) params.set("subtitle", post.location);
  router.push(`/home/share-event?${params.toString()}` as never);
}
