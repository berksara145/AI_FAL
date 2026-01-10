import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// @expo/vector-icons is included with Expo, but if not available, use react-native-vector-icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import ExploreScreen from "../screens/explore/ExploreScreen";
import PersonsScreen from "../screens/persons/PersonsScreen";
import SettingsScreen from "../screens/explore/SettingsScreen";
import HistoryScreen from "../screens/explore/HistoryScreen";

export type MainTabsParamList = {
  Explore: undefined;
  Persons: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Header buttons component that uses parent navigation
function HeaderButtons() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  
  return (
    <View style={{ flexDirection: "row", marginRight: 8 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate("History")}
        style={{ marginRight: 16 }}
      >
        <MaterialCommunityIcons name="history" size={24} color="#6200ee" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Settings")}
        style={{ marginRight: 16 }}
      >
        <MaterialCommunityIcons name="cog-outline" size={24} color="#6200ee" />
      </TouchableOpacity>
    </View>
  );
}

// Bottom tabs component
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#757575",
        headerRight: () => <HeaderButtons />,
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Persons"
        component={PersonsScreen}
        options={{
          tabBarLabel: "Persons",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main stack that wraps bottom tabs and includes Settings/History
export default function MainTabs() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "History",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
