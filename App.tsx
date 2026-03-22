import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, AppState, View } from "react-native";

import RootStack from "./navigation/RootStack";
import "./global.css";
import i18n, { loadStoredLanguage } from "./lib/i18n";

export default function App() {
  useEffect(() => {
    // With edge-to-edge enabled (RN 0.81+), the nav bar is transparent —
    // setBackgroundColorAsync is not supported. Only set button icon style.
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("light").catch(() => {});
    }
    // Load persisted language preference
    loadStoredLanguage().then((lang) => {
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    });
  }, []);

  return (
    // Wrapper fills the area behind the transparent nav bar in edge-to-edge mode
    <View style={{ flex: 1, backgroundColor: "#050016" }}>
      <NavigationContainer>
        <RootStack />
        <StatusBar style="light" />
      </NavigationContainer>
    </View>
  );
}
