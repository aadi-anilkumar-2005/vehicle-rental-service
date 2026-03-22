import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right', // Standard professional transition
      }}
    >
      {/* Account Group */}
      <Stack.Screen name="EditProfile" />
      <Stack.Screen name="KYCVerification" />
      <Stack.Screen name="Notifications" />

      {/* Activity Group */}
      <Stack.Screen name="BookingHistory" />
      <Stack.Screen name="SavedLocations" />
      <Stack.Screen name="Favorites" />
      <Stack.Screen name="PaymentMethods" />

      {/* Support & Settings Group */}
      <Stack.Screen name="Settings" />
      <Stack.Screen name="PrivacySecurity" />
      <Stack.Screen name="HelpSupport" />
    </Stack>
  );
}