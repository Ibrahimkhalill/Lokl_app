import React from "react";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import HomeIcon from "../../assets/icons/home.svg";
import ExploreIcon from "../../assets/icons/explore.svg";
import PostIcon from "../../assets/icons/posts.svg";
import EventsIcon from "../../assets/icons/events.svg";
import ProfileIcon from "../../assets/icons/profile.svg";
import type { SvgProps } from "react-native-svg";

type SvgIcon = React.ComponentType<SvgProps>;

function SvgTabIcon({
  Icon,
  focused,
  label,
}: {
  Icon: SvgIcon;
  focused: boolean;
  label: string;
}) {
  const color = focused ? Colors.black : Colors.white;
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Icon width={22} height={22} color={color} />
      {focused ? <Text style={styles.tabLabel}>{label}</Text> : null}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarIconStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarItemStyle: {
          flex: 1,
          paddingVertical: 0,
          marginVertical: 0,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={HomeIcon} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={ExploreIcon} focused={focused} label="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={PostIcon} focused={focused} label="Post" />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={EventsIcon} focused={focused} label="Events" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={ProfileIcon} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 50,
    gap: 4,
    minHeight: 40,
  },
  tabItemActive: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    minWidth: 80,
    paddingHorizontal: 12,
  },
  tabLabel: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: "700",
  },
});
