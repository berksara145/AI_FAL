import React, { useState, useRef, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated as RNAnimated,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "./RootStack";
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
import Svg, {
  Defs,
  RadialGradient as SvgGradient,
  Stop,
  Rect,
  Line as SvgLine,
  Circle as SvgCircle,
} from "react-native-svg";

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
const { width: W, height: H } = Dimensions.get("window");
const SCREEN_WIDTH = W;

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

// ── Static star field ──
const STARS = Array.from({ length: 90 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  return {
    x: (((seed * 1.3) % 233280) / 233280) * W,
    y: (((seed * 2.7) % 233280) / 233280) * H,
    size: 0.8 + ((seed % 4) * 0.55),
    opacity: 0.12 + ((seed % 7) / 7) * 0.5,
  };
});

// ── Twinkling stars ──
const TWINKLE_STARS = Array.from({ length: 18 }, (_, i) => {
  const seed = (i * 6271 + 13337) % 233280;
  return {
    x: (((seed * 1.9) % 233280) / 233280) * W,
    y: (((seed * 3.3) % 233280) / 233280) * H,
    size: 1.4 + ((seed % 3) * 0.7),
  };
});

// ── Constellation patterns ──
const CONSTELLATIONS = [
  {
    nodes: [{ x: 0.06, y: 0.05 }, { x: 0.14, y: 0.10 }, { x: 0.09, y: 0.17 }, { x: 0.18, y: 0.21 }],
    edges: [[0, 1], [1, 2], [2, 3]],
  },
  {
    nodes: [{ x: 0.83, y: 0.04 }, { x: 0.91, y: 0.09 }, { x: 0.86, y: 0.16 }, { x: 0.94, y: 0.20 }],
    edges: [[0, 1], [1, 2], [2, 3]],
  },
  {
    nodes: [{ x: 0.04, y: 0.69 }, { x: 0.11, y: 0.75 }, { x: 0.06, y: 0.83 }, { x: 0.13, y: 0.88 }],
    edges: [[0, 1], [1, 2], [2, 3]],
  },
  {
    nodes: [{ x: 0.87, y: 0.72 }, { x: 0.93, y: 0.78 }, { x: 0.88, y: 0.86 }],
    edges: [[0, 1], [1, 2]],
  },
];

// ── Shooting star configs ──
const SHOOT_CONFIGS = [
  { sx: W * 0.08, sy: H * 0.04, dx: W * 0.32, dy: H * 0.20, period: 11000, offset: 1200 },
  { sx: W * 0.52, sy: H * 0.01, dx: W * 0.28, dy: H * 0.18, period: 15000, offset: 5500 },
  { sx: W * 0.01, sy: H * 0.33, dx: W * 0.26, dy: H * 0.16, period: 18000, offset: 9000 },
];

function BottomTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "MainApp">>();
  const initialTab = (route.params as any)?.initialTab ?? 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  const translateX = useSharedValue(-initialTab * SCREEN_WIDTH);
  const activeTabShared = useSharedValue(initialTab);

  // ── Star animations ──
  const twinkleAnims = useRef(
    TWINKLE_STARS.map(() => new RNAnimated.Value(0.25))
  ).current;
  const shootAnims = useRef(
    SHOOT_CONFIGS.map(() => new RNAnimated.Value(0))
  ).current;

  useEffect(() => {
    twinkleAnims.forEach((anim, i) => {
      const dur = 1500 + (i * 373 % 1400);
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(i * 260),
          RNAnimated.timing(anim, { toValue: 1, duration: dur, useNativeDriver: true }),
          RNAnimated.timing(anim, { toValue: 0.1, duration: dur, useNativeDriver: true }),
        ])
      ).start();
    });

const timers: ReturnType<typeof setTimeout>[] = [];
    shootAnims.forEach((anim, i) => {
      const { period, offset } = SHOOT_CONFIGS[i];
      const timer = setTimeout(() => {
        anim.setValue(0);
        RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
            RNAnimated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }),
            RNAnimated.delay(period - 1000),
          ])
        ).start();
      }, offset);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

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
    <View style={styles.container}>

      {/* ── Nebula + constellation SVG layer (fixed behind everything) ── */}
      <Svg style={StyleSheet.absoluteFill} width={W} height={H} pointerEvents="none">
        <Defs>
          <SvgGradient id="mneb1" cx={W * 0.45} cy={H * 0.16} r={W * 0.58} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.30" />
            <Stop offset="55%"  stopColor="#4c1d95" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id="mneb2" cx={W * 0.92} cy={H * 0.45} r={W * 0.48} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#1e3a8a" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#1e3a8a" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id="mneb3" cx={W * 0.5} cy={H * 0.95} r={W * 0.55} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#92400e" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#92400e" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id="mneb4" cx={W * 0.10} cy={H * 0.75} r={W * 0.38} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#5b21b6" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#5b21b6" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id="mneb5" cx={W * 0.88} cy={H * 0.09} r={W * 0.28} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#0e7490" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#0e7490" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id="mneb6" cx={W * 0.05} cy={H * 0.42} r={W * 0.30} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#9d174d" stopOpacity="0.11" />
            <Stop offset="100%" stopColor="#9d174d" stopOpacity="0"    />
          </SvgGradient>
        </Defs>
        <Rect width={W} height={H} fill="url(#mneb1)" />
        <Rect width={W} height={H} fill="url(#mneb2)" />
        <Rect width={W} height={H} fill="url(#mneb3)" />
        <Rect width={W} height={H} fill="url(#mneb4)" />
        <Rect width={W} height={H} fill="url(#mneb5)" />
        <Rect width={W} height={H} fill="url(#mneb6)" />
        {CONSTELLATIONS.flatMap(({ nodes, edges }, ci) =>
          edges.map(([a, b], ei) => (
            <SvgLine
              key={`ml-${ci}-${ei}`}
              x1={nodes[a].x * W} y1={nodes[a].y * H}
              x2={nodes[b].x * W} y2={nodes[b].y * H}
              stroke="rgba(212,175,55,0.22)"
              strokeWidth="0.6"
            />
          ))
        )}
        {CONSTELLATIONS.flatMap(({ nodes }, ci) =>
          nodes.map((n, ni) => (
            <SvgCircle
              key={`mn-${ci}-${ni}`}
              cx={n.x * W} cy={n.y * H}
              r="1.8"
              fill="rgba(212,175,55,0.55)"
            />
          ))
        )}
      </Svg>

{/* ── Static stars ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {STARS.map((s, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: s.x, top: s.y,
              width: s.size, height: s.size,
              borderRadius: s.size,
              backgroundColor: "#fff",
              opacity: s.opacity,
            }}
          />
        ))}
      </View>

      {/* ── Twinkling stars ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {TWINKLE_STARS.map((s, i) => (
          <RNAnimated.View
            key={i}
            style={{
              position: "absolute",
              left: s.x, top: s.y,
              width: s.size, height: s.size,
              borderRadius: s.size,
              backgroundColor: "#e8d080",
              opacity: twinkleAnims[i],
            }}
          />
        ))}
      </View>

      {/* ── Shooting stars ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {SHOOT_CONFIGS.map(({ sx, sy, dx, dy }, i) => {
          const progress = shootAnims[i];
          const tX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
          const tY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
          const opacity = progress.interpolate({
            inputRange: [0, 0.05, 0.65, 1],
            outputRange: [0, 0.85, 0.2, 0],
          });
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <RNAnimated.View
              key={i}
              style={{
                position: "absolute",
                left: sx, top: sy,
                width: 55, height: 1.5,
                borderRadius: 1,
                backgroundColor: "rgba(255,248,220,0.95)",
                opacity,
                transform: [{ translateX: tX }, { translateY: tY }, { rotate: `${angle}deg` }],
              }}
            />
          );
        })}
      </View>

      {/* ── Swipeable screens ── */}
      <GestureDetector gesture={gesture}>
        <View style={[styles.screenArea, { paddingTop: insets.top }]}>
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

      {/* ── Floating header buttons (hover over content, no background) ── */}
      <View style={[styles.floatingButtons, { top: insets.top + 4 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.floatingBtn} onPress={() => navigation.navigate("Settings")}>
          <MaterialCommunityIcons name="cog-outline" size={24} color="#d4af37" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.floatingBtn} onPress={() => navigation.navigate("History")}>
          <MaterialCommunityIcons name="history" size={24} color="#d4af37" />
        </TouchableOpacity>
      </View>

      {/* ── Tab bar ── */}
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
  floatingButtons: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  floatingBtn: {
    padding: 10,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(26,13,46,0.85)",
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
