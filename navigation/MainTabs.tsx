import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Screens
import ExploreScreen from "../screens/explore/ExploreScreen";
import OrbitScreen from "../screens/orbit/OrbitScreen";
import SettingsScreen from "../screens/explore/SettingsScreen";
import HistoryScreen from "../screens/explore/HistoryScreen";
import PersonDetailScreen from "../screens/orbit/PersonDetailScreen";

export type MainTabsParamList = {
  Insights: undefined;
  Orbit: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  History: undefined;
  PersonDetail: {
    name: string;
    zodiac: string;
    zodiacSymbol: string;
    birthDate: string;
  };
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

function HeaderLeft() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  return (
    <View style={{ minWidth: 56, alignItems: "flex-start", paddingLeft: 16 }}>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <MaterialCommunityIcons name="cog-outline" size={24} color="#d4af37" />
      </TouchableOpacity>
    </View>
  );
}

function HeaderRight() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  return (
    <View style={{ minWidth: 56, alignItems: "flex-end", paddingRight: 16 }}>
      <TouchableOpacity onPress={() => navigation.navigate("History")}>
        <MaterialCommunityIcons name="history" size={24} color="#d4af37" />
      </TouchableOpacity>
    </View>
  );
}

function BottomTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  const translateX = useSharedValue(0);
  const activeTabShared = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      "worklet";
      const base = -activeTabShared.value * SCREEN_WIDTH;
      translateX.value = Math.max(-SCREEN_WIDTH, Math.min(0, base + e.translationX));
    })
    .onEnd((e) => {
      "worklet";
      const projected = translateX.value + e.velocityX * 0.15;
      const target = projected < -SCREEN_WIDTH / 2 ? 1 : 0;
      activeTabShared.value = target;
      translateX.value = withSpring(-target * SCREEN_WIDTH, SPRING_CONFIG);
      runOnJS(setActiveTab)(target);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const tapToTab = (index: number) => {
    activeTabShared.value = index;
    translateX.value = withSpring(-index * SCREEN_WIDTH, SPRING_CONFIG);
    setActiveTab(index);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {activeTab === 0 ? (
          <>
            <HeaderLeft />
            <View style={{ flex: 1 }} />
            <HeaderRight />
          </>
        ) : (
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>{t("navigation.birthChart")}</Text>
          </View>
        )}
      </View>

      {/* Swipeable screens */}
      <GestureDetector gesture={gesture}>
        <View style={styles.screenArea}>
          <Animated.View style={[styles.screensRow, animatedStyle]}>
            <View style={styles.screenSlot}>
              <ExploreScreen />
            </View>
            <View style={styles.screenSlot}>
              <OrbitScreen />
            </View>
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Tab bar */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => tapToTab(0)}>
          <MaterialCommunityIcons
            name="compass-outline"
            size={24}
            color={activeTab === 0 ? "#d4af37" : "rgba(212,175,55,0.5)"}
          />
          <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>
            {t("navigation.insights")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => tapToTab(1)}>
          <MaterialCommunityIcons
            name="orbit-variant"
            size={24}
            color={activeTab === 1 ? "#d4af37" : "rgba(212,175,55,0.5)"}
          />
          <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>
            {t("navigation.birthChart")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0d2e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: "#1a0d2e",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(212,175,55,0.15)",
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 1,
  },
  screenArea: {
    flex: 1,
    overflow: "hidden",
  },
  screensRow: {
    flex: 1,
    flexDirection: "row",
    width: SCREEN_WIDTH * 2,
  },
  screenSlot: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1a0d2e",
    borderTopWidth: 1,
    borderTopColor: "rgba(212,175,55,0.2)",
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: "rgba(212,175,55,0.5)",
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: "#d4af37",
  },
});

export default function MainTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1a0d2e" },
        headerTintColor: "#d4af37",
        headerTitleStyle: { color: "#d4af37", fontWeight: "400" },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="PersonDetail"
        component={PersonDetailScreen}
        options={{ title: "", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
