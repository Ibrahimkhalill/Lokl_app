import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="auth/choose-role" />
        <Stack.Screen name="auth/business-signup" />
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
        <Stack.Screen name="explore/notifications" />
        <Stack.Screen name="explore/user-profile" />
        
        <Stack.Screen name="chat/inbox" />
        <Stack.Screen name="chat/id" />

        <Stack.Screen name="events/event-details" />
        <Stack.Screen name="events/group-detail" />
        <Stack.Screen name="events/group-create" />
        <Stack.Screen name="events/chatting" />
        <Stack.Screen name="events/reviews" />
        <Stack.Screen name="events/friends-here" />
        <Stack.Screen name="events/share-event" />
        <Stack.Screen name="events/gallery" />

        <Stack.Screen name="profile/streaks" />
        <Stack.Screen name="profile/follow" />
        <Stack.Screen name="profile/posts" />


        <Stack.Screen name="settings/setting" />
        <Stack.Screen name="settings/account" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/privacy-security" />
        <Stack.Screen name="settings/preferences" />
        <Stack.Screen name="settings/terms" />
        <Stack.Screen name="settings/privacy-policy" />
        

      </Stack>
    </>
  );
}
