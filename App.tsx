import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, AppState } from "react-native";

import RootStack from "./navigation/RootStack";
import "./global.css";

const setNavigationBarStyle = () => {
  if (Platform.OS === "android") {
    NavigationBar.setButtonStyleAsync("light").catch(() => {
      // Silently fail if not supported
    });
  }
};

export default function App() {
  useEffect(() => {
    // Set navigation bar immediately on mount
    setNavigationBarStyle();

    // Also set it when app comes to foreground (resume from background)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setNavigationBarStyle();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <RootStack />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
