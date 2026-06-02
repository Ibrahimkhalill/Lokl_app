import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { api } from "../lib/api";
import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tokenEntry, userEntry] = await AsyncStorage.multiGet([
          "accessToken",
          "user",
        ]);
        if (tokenEntry[1] && userEntry[1]) {
          setUser(JSON.parse(userEntry[1]));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(
    accessToken: string,
    refreshToken: string,
    userData: User
  ) {
    await AsyncStorage.multiSet([
      ["accessToken", accessToken],
      ["refreshToken", refreshToken],
      ["user", JSON.stringify(userData)],
    ]);
    setUser(userData);
  }

  async function logout() {
    const role = user?.role;
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout/", { refresh: refreshToken }).catch(() => {});
      }
    } catch {
      // ignore
    } finally {
      await AsyncStorage.clear();
      setUser(null);
      router.replace(role === "Business" ? "/auth/business-signin" : "/auth/sign-in");
    }
  }

  async function updateUser(userData: User) {
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
