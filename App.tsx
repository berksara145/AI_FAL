import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import RootStack from "./navigation/RootStack";
import "./global.css";
import i18n, { loadStoredLanguage } from "./lib/i18n";
import { initDatabase, resetDatabaseForDev } from "./db/database";

// ============================================================
// DEV ONLY — Delete these 2 lines before production build
const DEV_RESET_DB = true;
// ============================================================

export default function App() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("light").catch(() => {});
    }
    // DEV ONLY — Delete this block before production build
    if (DEV_RESET_DB) {
      initDatabase().then(() => resetDatabaseForDev()).catch(() => {});
    }
    loadStoredLanguage().then((lang) => {
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#050016" }}>
          <NavigationContainer>
            <RootStack />
            <StatusBar style="light" />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
