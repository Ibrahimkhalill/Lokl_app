import React from "react";
import { Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import BusinessProfileScreen from "../business/profile";
import ProfileScreen from "../user/profile";

const TAB_BAR_STYLE = {
  backgroundColor: "#1F2A44",
  borderWidth: 1,
  borderColor: "#2E3A3F",
  height: 64,
  paddingHorizontal: 12,
  paddingBottom: 0,
  paddingTop: 0,
  marginHorizontal: 16,
  marginBottom: 20,
  borderRadius: 40,
  position: "absolute" as const,
  left: 0,
  right: 0,
  bottom: 0,
  elevation: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
};

export default function Profile() {
  const { user } = useAuth();

  return (
    <>
      <Tabs.Screen options={{ tabBarStyle: TAB_BAR_STYLE }} />
      {user?.role === "Business" ? <BusinessProfileScreen /> : <ProfileScreen />}
    </>
  );
}
