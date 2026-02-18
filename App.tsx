import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";

import RootStack from "./navigation/RootStack";
import "./global.css";

export default function App() {
  useEffect(() => {
    // Set navigation bar button style for Android
    // Note: Custom native code requires a development build (not Expo Go)
    // For Expo Go, only setButtonStyleAsync works, but background color won't apply
    if (Platform.OS === "android") {
      // Try to set button style (works in Expo Go)
      NavigationBar.setButtonStyleAsync("light").catch(() => {
        // Silently fail if not supported
      });
    }
  }, []);

  return (
    <NavigationContainer>
      <RootStack />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
