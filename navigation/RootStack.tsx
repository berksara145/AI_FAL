import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SplashScreen from "../screens/SplashScreen";
import UserInfoChatScreen from "../screens/onboarding/UserInfoChatScreen";
import ChatSessionScreen from "../screens/chat/ChatSessionScreen";
import AddPersonScreen from "../screens/orbit/AddPersonScreen";
import PremiumScreen from "../screens/premium/PremiumScreen";

// Navigation
import MainTabs from "./MainTabs";

export type RootStackParamList = {
  Splash: undefined;
  // Onboarding
  UserInfoChat: undefined;
  // Main App (contains bottom tabs)
  MainApp: { initialTab?: number } | undefined;
  // Add Person (full-screen form)
  AddPerson: undefined;
  // Premium paywall
  Premium: undefined;
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

      {/* Add Person - full-screen form */}
      <Stack.Screen
        name="AddPerson"
        component={AddPersonScreen}
        options={Platform.select({
          ios: { presentation: "fullScreenModal", headerShown: false },
          android: { presentation: "card", animation: "slide_from_bottom", headerShown: false },
          default: { presentation: "fullScreenModal", headerShown: false },
        })}
      />

      {/* Premium paywall - slides up as modal */}
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={Platform.select({
          ios: { presentation: "fullScreenModal", headerShown: false },
          android: { presentation: "card", animation: "slide_from_bottom", headerShown: false },
          default: { presentation: "fullScreenModal", headerShown: false },
        })}
      />

      {/* Chat Session - full-screen modal */}
      <Stack.Screen
        name="ChatSession"
        component={ChatSessionScreen}
        options={Platform.select({
          // On iOS: fullScreenModal slides up and is a true modal (correct keyboard behavior)
          ios: { presentation: "fullScreenModal", headerShown: false },
          // On Android: fullScreenModal = Dialog → ignores windowSoftInputMode (adjustResize broken).
          // Use card + slide_from_bottom for identical visuals with working keyboard.
          android: { presentation: "card", animation: "slide_from_bottom", headerShown: false },
          default: { presentation: "fullScreenModal", headerShown: false },
        })}
      />
    </Stack.Navigator>
  );
}
