import { useEffect, useRef } from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/api";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Colors } from "../constants/colors";
import { AuthProvider } from "../context/AuthContext";
import { MessageProvider } from "../context/MessageContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { ToastProvider } from "../context/ToastContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let sessionStarting = false;

async function startSession() {
  if (sessionStarting) return;
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return; // not logged in — skip silently
    sessionStarting = true;
    const res = await api.post("/analytics/session/start/");
    const sessionId = res.data?.session_id;
    if (sessionId != null) {
      await AsyncStorage.setItem("session_id", String(sessionId));
    }
  } catch {} finally {
    sessionStarting = false;
  }
}

async function endSession() {
  try {
    const sessionId = await AsyncStorage.getItem("session_id");
    if (!sessionId) return;
    await AsyncStorage.removeItem("session_id"); // remove first — prevents double-end
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    await api.post("/analytics/session/end/", { session_id: Number(sessionId) });
  } catch {}
}

async function registerPushToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    // Store locally — AuthContext will send it to the backend after login
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem("expoPushToken", token);
  } catch {
    // Silently skip on simulators or when permissions are unavailable
  }
}

export default function RootLayout() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(Colors.background);
    void registerPushToken();

    // Start session on launch
    void startSession();

    const subscription = AppState.addEventListener("change", (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;

      if (prev.match(/inactive|background/) && next === "active") {
        // App came to foreground
        void startSession();
      } else if (prev === "active" && next.match(/inactive|background/)) {
        // App went to background
        void endSession();
      }
    });

    return () => {
      subscription.remove();
      void endSession();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <BottomSheetModalProvider>
    <AuthProvider>
      <PreferencesProvider>
      <MessageProvider>
      <ToastProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/email-otp-verifications" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="auth/choose-role" />
        <Stack.Screen name="auth/business-signup" />
        <Stack.Screen name="auth/business-signin" />
        <Stack.Screen name="auth/what-looking-for" />
        <Stack.Screen name="auth/what-are-you-into" />
        <Stack.Screen name="auth/location" />
        <Stack.Screen name="auth/congratulations" />
        <Stack.Screen name="auth/terms" />

        <Stack.Screen name="home/details" />
        <Stack.Screen name="home/filters" />
        <Stack.Screen name="home/search" />
        <Stack.Screen name="home/share-event" />
        <Stack.Screen name="home/friends-think" />
        <Stack.Screen name="home/post" />

        <Stack.Screen name="explore/notifications" />
        <Stack.Screen name="explore/user-profile" />

        <Stack.Screen name="chat/inbox" />
        <Stack.Screen name="chat/id" />

        <Stack.Screen name="events/event-details" />
        <Stack.Screen name="events/group-detail" />
        <Stack.Screen name="events/group-create" />
        <Stack.Screen name="events/reviews" />
        <Stack.Screen name="events/friends-here" />
        <Stack.Screen name="events/share-event" />
        <Stack.Screen name="events/gallery" />

        <Stack.Screen name="settings/setting" />
        <Stack.Screen name="settings/account" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/privacy-security" />
        <Stack.Screen name="settings/preferences" />
        <Stack.Screen name="settings/terms" />
        <Stack.Screen name="settings/privacy-policy" />

        <Stack.Screen name="business/create-event" />
        <Stack.Screen name="business/event-detail" />
        <Stack.Screen name="business/profile" />
      </Stack>
      </ToastProvider>
      </MessageProvider>
      </PreferencesProvider>
    </AuthProvider>
    </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
