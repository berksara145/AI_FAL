import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import RootStack from "./navigation/RootStack";
import "./global.css";

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
