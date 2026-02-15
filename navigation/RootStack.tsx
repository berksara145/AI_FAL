import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SplashScreen from "../screens/SplashScreen";
import UserInfoChatScreen from "../screens/onboarding/UserInfoChatScreen";
import ChatSessionScreen from "../screens/chat/ChatSessionScreen";

// Navigation
import MainTabs from "./MainTabs";

export type RootStackParamList = {
  Splash: undefined;
  // Onboarding
  UserInfoChat: undefined;
  // Main App (contains bottom tabs)
  MainApp: undefined;
  // Chat Session (full-screen, reusable)
  ChatSession: {
    sessionId?: string;
    mode?: "interactive" | "readonly";
    feature?: string; // e.g., "dailyHoroscope", "compatibility", "big3", "birthMap", etc.
    initialMessage?: string; // Predetermined initial message from AI
    /** Explore classes: system prompt / agenda for this conversation (from ExploreScreen) */
    agenda?: string;
    birthDate?: string; // For birth map feature
    personName?: string; // Optional person name to operate on (for birthMap)
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Splash - demo/MVP showcase */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* Onboarding Flow */}
      <Stack.Screen name="UserInfoChat" component={UserInfoChatScreen} />

      {/* Main App (Bottom Tabs: Insights / Persons) */}
      <Stack.Screen name="MainApp" component={MainTabs} />

      {/* Chat Session - full-screen modal */}
      <Stack.Screen 
        name="ChatSession" 
        component={ChatSessionScreen}
        options={{ 
          presentation: "fullScreenModal",
          headerShown: false // use custom ChatHeader inside the screen
        }}
      />
    </Stack.Navigator>
  );
}
