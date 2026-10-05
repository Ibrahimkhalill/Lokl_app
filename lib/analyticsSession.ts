import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

// One in-flight start at a time; the flag is set synchronously so concurrent callers can't both pass.
let sessionStarting: Promise<void> | null = null;

export function startSession(): Promise<void> {
  if (sessionStarting) return sessionStarting;
  sessionStarting = (async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return; // not logged in — skip silently
      if (await AsyncStorage.getItem("session_id")) return; // already have an open session
      const res = await api.post("/analytics/session/start/");
      const sessionId = res.data?.session_id;
      if (sessionId != null) {
        await AsyncStorage.setItem("session_id", String(sessionId));
      }
    } catch {
    } finally {
      sessionStarting = null;
    }
  })();
  return sessionStarting;
}

export async function endSession() {
  try {
    if (sessionStarting) await sessionStarting; // don't race a start that's still running
    const sessionId = await AsyncStorage.getItem("session_id");
    if (!sessionId) return;
    await AsyncStorage.removeItem("session_id"); // remove first — prevents double-end
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    await api.post("/analytics/session/end/", { session_id: Number(sessionId) });
  } catch {}
}

