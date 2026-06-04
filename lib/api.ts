import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const BASE_URL = "https://d118-103-159-73-203.ngrok-free.app/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("[REQ]", config.method?.toUpperCase(), config.url, "auth:", !!token, "body type:", config.data?.constructor?.name);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const res = await axios.get(`${BASE_URL}/auth/refresh-token`, {
          params: { refreshToken },
        });
        const d = res.data;
        const newToken =
          d?.data?.accessToken ??
          d?.data?.access_token ??
          d?.data?.access ??
          d?.accessToken ??
          d?.access_token ??
          d?.access;
        console.log("[Refresh] response:", JSON.stringify(d));
        if (!newToken) throw new Error("No token in refresh response");
        await AsyncStorage.setItem("accessToken", newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
        router.replace("/auth/sign-in");
      }
    }
    return Promise.reject(error);
  }
);

function extractMessage(data: any): string | null {
  if (!data || typeof data !== "object") return null;
  if (data.detail) return String(data.detail);
  if (data.message && data.message !== "Error") return String(data.message);
  if (data.errors && typeof data.errors === "object") {
    const msgs = Object.entries(data.errors).map(([k, v]) => {
      const msg = Array.isArray(v) ? v[0] : v;
      return `${k}: ${msg}`;
    });
    if (msgs.length > 0) return msgs.join("\n");
  }
  const skip = new Set(["success", "status", "message", "errors"]);
  const fieldErrors = Object.entries(data)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => {
      const msg = Array.isArray(v) ? v[0] : v;
      return `${k}: ${msg}`;
    });
  if (fieldErrors.length > 0) return fieldErrors.join("\n");
  return null;
}

const SERVER_HOST = BASE_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, ""); // e.g. "10.10.12.8:8004"

export function fixMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/localhost(:\d+)?/, SERVER_HOST);
}

export function getErrorMessage(error: unknown): string {
  // fetch-based errors (from fetchMultipart)
  if (error instanceof Error && (error as any).response) {
    const data = (error as any).response?.data;
    console.log("[API Error]", JSON.stringify({ status: (error as any).response?.status, data }, null, 2));
    return extractMessage(data) ?? error.message ?? "Something went wrong";
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    console.log("[API Error]", JSON.stringify({ status: error.response?.status, data }, null, 2));
    return extractMessage(data) ?? error.message ?? "Something went wrong";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
