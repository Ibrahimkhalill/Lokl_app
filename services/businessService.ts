import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, BASE_URL } from "../lib/api";

async function fetchMultipart(path: string, method: "POST" | "PATCH", data: FormData) {
  const token = await AsyncStorage.getItem("accessToken");
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(json?.message || json?.detail || "Request failed");
    err.response = { status: res.status, data: json };
    throw err;
  }
  return { data: json };
}

export const businessService = {
  getBusinessProfile() {
    return api.get("/business/profile/");
  },

  getBusinessProfileById(id: number) {
    return api.get(`/business/${id}/`);
  },

  getBusinessEvents(id: number) {
    return api.get(`/business/${id}/events/`);
  },

  updateBusinessProfile(data: {
    business_name?: string;
    owner_name?: string;
    bio?: string;
    address?: string;
    website?: string;
    social_media?: { platform: string; link: string }[];
  }) {
    return api.patch("/business/profile/", data);
  },

  getMyProfile() {
    return api.get("/settings/profile/");
  },

  getMyEvents() {
    return api.get("/events/my/");
  },

  deleteEvent(id: number) {
    return api.delete(`/events/${id}/`);
  },

  createEvent(data: FormData) {
    return fetchMultipart("/events/", "POST", data);
  },

  updateProfileMedia(data: FormData) {
    return fetchMultipart("/business/profile/", "PATCH", data);
  },
};
