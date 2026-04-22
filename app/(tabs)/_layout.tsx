import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  icon,
  label,
  focused,
  isPost = false,
}: {
  icon: IoniconsName;
  label: string;
  focused: boolean;
  isPost?: boolean;
}) {
  if (isPost) {
    return (
      <View style={[styles.tabItem, focused && styles.tabItemActive]}>
        <Ionicons
          name="add-circle-outline"
          size={22}
          color={focused ? Colors.black : Colors.white}
        />
        {focused && <Text style={styles.tabLabel}>{label}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Ionicons
        name={icon}
        size={20}
        color={focused ? Colors.black : Colors.white}
      />
      {focused && <Text style={styles.tabLabel}>{label}</Text>}
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
          width: "100%",
          height: "100%",
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          marginVertical: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="home-outline" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="compass-outline" label="Explore" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="add" label="Post" focused={focused} isPost />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="calendar-outline" label="Events" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="person-outline" label="Profile" focused={focused} />
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
    borderRadius: 50,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    width: 80,
  },
  tabLabel: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: "700",
  },
});
