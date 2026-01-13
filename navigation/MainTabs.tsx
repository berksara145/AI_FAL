import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, View, Text, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// @expo/vector-icons is included with Expo, but if not available, use react-native-vector-icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import ExploreScreen from "../screens/explore/ExploreScreen";
import OrbitScreen from "../screens/orbit/OrbitScreen";
import SettingsScreen from "../screens/explore/SettingsScreen";
import HistoryScreen from "../screens/explore/HistoryScreen";

export type MainTabsParamList = {
  Insights: undefined;
  Orbit: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Header left button (Settings)
function HeaderLeft() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  
  return (
    <View style={{ minWidth: 56, alignItems: "flex-start", paddingLeft: 16 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Settings")}
      >
        <MaterialCommunityIcons name="cog-outline" size={24} color="#d4af37" />
      </TouchableOpacity>
    </View>
  );
}

// Header right button (History)
function HeaderRight() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  
  return (
    <View style={{ minWidth: 56, alignItems: "flex-end", paddingRight: 16 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate("History")}
      >
        <MaterialCommunityIcons name="history" size={24} color="#d4af37" />
      </TouchableOpacity>
    </View>
  );
}

// Custom header title for Insights
function InsightsHeaderTitle() {
  return (
    <Text
      style={{
        fontSize: 20,
        fontWeight: "400",
        color: "#d4af37",
        letterSpacing: 3.5,
        fontFamily: Platform.select({
          ios: "Georgia",
          android: "serif",
          default: "serif",
        }),
      }}
    >
      Insights
    </Text>
  );
}

// Bottom tabs component
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#1a0d2e",
        },
        headerTintColor: "#d4af37",
        headerTitleStyle: {
          color: "#d4af37",
          fontWeight: "400",
          letterSpacing: 1,
        },
        tabBarStyle: {
          backgroundColor: "#1a0d2e",
          borderTopWidth: 1,
          borderTopColor: "rgba(212, 175, 55, 0.2)",
        },
        tabBarActiveTintColor: "#d4af37",
        tabBarInactiveTintColor: "rgba(212, 175, 55, 0.5)",
        headerTitleAlign: "center",
      }}
    >
      <Tab.Screen
        name="Insights"
        component={ExploreScreen}
        options={{
          tabBarLabel: "Insights",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass-outline" size={size} color={color} />
          ),
          headerTitle: () => <InsightsHeaderTitle />,
          headerTitleAlign: "center",
          headerLeft: () => <HeaderLeft />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tab.Screen
        name="Orbit"
        component={OrbitScreen}
        options={{
          tabBarLabel: "Orbit",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="orbit-variant" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main stack that wraps bottom tabs and includes Settings/History
export default function MainTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a0d2e",
        },
        headerTintColor: "#d4af37",
        headerTitleStyle: {
          color: "#d4af37",
          fontWeight: "400",
        },
      }}
    >
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
