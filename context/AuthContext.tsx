import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { api, SESSION_KEYS, setSessionExpiredHandler } from "../lib/api";
import { settingService } from "../services/settingServices";
import { endSession } from "../lib/analyticsSession";
import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  /** Clears the local session without calling the server (e.g. after account deletion). */
  clearSession: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function signInRouteFor(role?: string) {
  return role === "Business" ? "/auth/business-signin" : "/auth/sign-in";
}

function flushPushToken() {
  AsyncStorage.getItem("expoPushToken").then((token) => {
    if (token) settingService.savePushToken(token).catch(() => {});
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  useEffect(() => {
    (async () => {
      try {
        const [tokenEntry, userEntry] = await AsyncStorage.multiGet([
          "accessToken",
          "user",
        ]);
        if (tokenEntry[1] && userEntry[1]) {
          setUser(JSON.parse(userEntry[1]));
          // Re-send push token on every app restart so it stays current
          flushPushToken();
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // When the API layer gives up on refreshing, reset in-memory auth state too.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      const role = userRef.current?.role;
      setUser(null);
      router.replace(signInRouteFor(role));
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback(
    async (accessToken: string, refreshToken: string, userData: User) => {
      await AsyncStorage.multiSet([
        ["accessToken", accessToken],
        ["refreshToken", refreshToken],
        ["user", JSON.stringify(userData)],
      ]);
      setUser(userData);
      flushPushToken();
    },
    []
  );

  const clearSession = useCallback(async () => {
    const role = userRef.current?.role;
    // Only remove session keys — keep the device push token and local preferences.
    await AsyncStorage.multiRemove(SESSION_KEYS);
    setUser(null);
    router.replace(signInRouteFor(role));
  }, []);

  const logout = useCallback(async () => {
    try {
      await endSession();
      // Stop this device receiving the user's pushes before the token is gone.
      await settingService.clearPushToken().catch(() => {});
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout/", { refresh: refreshToken }).catch(() => {});
      }
    } catch {
      // ignore
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const updateUser = useCallback(async (userData: User) => {
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      logout,
      clearSession,
      updateUser,
    }),
    [user, isLoading, login, logout, clearSession, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
