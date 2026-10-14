import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.loklusa.com/api";

/** WebSocket origin matching the API: https → wss, http → ws. */
export const WS_BASE = BASE_URL.replace(/^http/, "ws").replace(/\/api\/?$/, "");

/** Storage keys that make up a logged-in session (cleared on logout / expiry). */
export const SESSION_KEYS = ["accessToken", "refreshToken", "user", "session_id"];

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Session-expiry listener (AuthContext subscribes so it can reset state + redirect) ──
let sessionExpiredHandler: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class SessionExpiredError extends Error {}

// Single in-flight refresh shared by every request that hits a 401 at the same time.
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) throw new SessionExpiredError("No refresh token");
  try {
    const res = await axios.get(`${BASE_URL}/auth/refresh-token`, {
      params: { refreshToken },
      timeout: 15000,
    });
    const d = res.data;
    const newToken =
      d?.data?.accessToken ??
      d?.data?.access_token ??
      d?.data?.access ??
      d?.accessToken ??
      d?.access_token ??
      d?.access;
    if (!newToken) throw new SessionExpiredError("No token in refresh response");
    await AsyncStorage.setItem("accessToken", newToken);
    return newToken;
  } catch (err) {
    // Only a definitive rejection of the refresh token ends the session.
    // Network errors / timeouts / 5xx keep the user logged in.
    const status = (err as AxiosError)?.response?.status;
    if (status === 400 || status === 401 || status === 403) {
      throw new SessionExpiredError("Refresh token rejected");
    }
    throw err;
  }
}

/** Returns a fresh access token, de-duplicating concurrent refreshes. */
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

let expiring = false;
async function expireSession() {
  if (expiring) return;
  expiring = true;
  try {
    await AsyncStorage.multiRemove(SESSION_KEYS);
    sessionExpiredHandler?.();
  } finally {
    expiring = false;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isRefreshCall = original?.url?.includes("/auth/refresh-token");
    if (error.response?.status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        if (refreshErr instanceof SessionExpiredError) {
          await expireSession();
        }
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

const SERVER_ORIGIN = BASE_URL.replace(/\/api\/?$/, ""); // e.g. "https://api.loklusa.com"
const SERVER_HOST = SERVER_ORIGIN.replace(/^https?:\/\//, "");
const SERVER_SCHEME = SERVER_ORIGIN.startsWith("https") ? "https" : "http";

export function fixMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(file|content|data|blob|ph|assets-library):/.test(url)) return url; // local device URIs
  if (url.startsWith("/")) return `${SERVER_ORIGIN}${url}`; // relative "/media/..." path
  // Backend builds absolute URLs from its own view of the request (localhost / 127.0.0.1 / plain http
  // behind the tunnel) — point them at the public server and match its scheme.
  const fixed = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/, SERVER_ORIGIN);
  const insecureSelf = `http://${SERVER_HOST}`;
  return SERVER_SCHEME === "https" && fixed.startsWith(insecureSelf)
    ? `https://${SERVER_HOST}${fixed.slice(insecureSelf.length)}`
    : fixed;
}

export function getErrorMessage(error: unknown): string {
  // fetch-based errors (from fetchMultipart)
  if (error instanceof Error && (error as any).response) {
    const data = (error as any).response?.data;
    if (__DEV__) console.log("[API Error]", (error as any).response?.status);
    return extractMessage(data) ?? error.message ?? "Something went wrong";
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (__DEV__) console.log("[API Error]", error.response?.status, error.config?.url);
    return extractMessage(data) ?? error.message ?? "Something went wrong";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
