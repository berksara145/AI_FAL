import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { getOrCreateUser } from "../db/user.repo";
import { useTranslation } from "react-i18next";
import StarfieldBackground from "../components/StarfieldBackground";

const { width: W, height: H } = Dimensions.get("window");

const ZODIAC_IMAGES = [
  { source: require("../assets/zodiacs/zodiacSign1.png"),  angle: -40 },
  { source: require("../assets/zodiacs/zodiacSign4.png"),  angle: 50 },
  { source: require("../assets/zodiacs/zodiacSign7.png"),  angle: 140 },
  { source: require("../assets/zodiacs/zodiacSign10.png"), angle: 230 },
];

const OUTER_R = 130;
const MID_R   = 90;
const INNER_R = 56;

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const FEATURES = [
    { glyph: "☽",        label: t("splash.feature1"), desc: t("splash.featureDesc1") },
    { glyph: "✦\uFE0E", label: t("splash.feature2"), desc: t("splash.featureDesc2") },
    { glyph: "♡\uFE0E", label: t("splash.feature3"), desc: t("splash.featureDesc3") },
    { glyph: "✧",        label: t("splash.feature4"), desc: t("splash.featureDesc4") },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const descOpacity = useRef(new Animated.Value(1)).current;
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const rotateAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;

  const switchToFeature = (idx: number) => {
    if (idx === activeIdxRef.current) return;
    activeIdxRef.current = idx;
    Animated.timing(descOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setActiveIdx(idx);
      Animated.timing(descOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    getOrCreateUser().catch(() => {});

    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 28000, useNativeDriver: true })
    ).start();

    const featureTimer = setInterval(() => {
      const next = (activeIdxRef.current + 1) % 4;
      switchToFeature(next);
    }, 3500);

    return () => clearInterval(featureTimer);
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 30 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#050016" />

      <StarfieldBackground idPrefix="sp" />

      {/* Radial purple glow */}
      <View style={styles.centralGlow} pointerEvents="none" />

      {/* Main content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Orbital hero */}
        <View style={styles.heroWrapper}>
          <Animated.View style={[styles.ring, styles.outerRing, { transform: [{ rotate }] }]}>
            {ZODIAC_IMAGES.map(({ source, angle }) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <Image
                  key={angle}
                  source={source}
                  style={[
                    styles.zodiacGlyph,
                    {
                      left: OUTER_R + Math.cos(rad) * OUTER_R - 12,
                      top:  OUTER_R + Math.sin(rad) * OUTER_R - 12,
                    },
                  ]}
                  resizeMode="contain"
                />
              );
            })}
          </Animated.View>

          <View style={[styles.ring, styles.midRing]} />
          <View style={[styles.ring, styles.innerRing]} />

          <View style={styles.centerCircle}>
            <Image source={require("../assets/golden_star.jpeg")} style={styles.centerStar} resizeMode="contain" />
          </View>
        </View>

        {/* App name */}
        <Text style={styles.appName}>LUNARA</Text>
        <Text style={styles.tagline}>{t("splash.tagline")}</Text>

        <View style={styles.divider} />

        {/* Feature circles */}
        <View style={styles.featureRow}>
          {FEATURES.map(({ glyph, label }, idx) => (
            <Pressable key={label} style={styles.featureItem} onPress={() => switchToFeature(idx)}>
              <View style={[styles.featureCircle, idx === activeIdx && styles.featureCircleActive]}>
                <Text style={[styles.featureGlyph, idx === activeIdx && styles.featureGlyphActive]}>{glyph}</Text>
              </View>
              <Text style={[styles.featureLabel, idx === activeIdx && styles.featureLabelActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Feature description card */}
        <Animated.View style={[styles.featureDescCard, { opacity: descOpacity }]}>
          <View style={styles.featureDescTopLine} />
          <Text style={styles.featureDescLabel}>✦ {FEATURES[activeIdx].label.toUpperCase()} ✦</Text>
          <Text style={styles.featureDescText}>{FEATURES[activeIdx].desc}</Text>
        </Animated.View>

      </Animated.View>

      {/* Fixed CTA */}
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom + 12, 32) }]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={() => navigation.replace("UserInfoChat")}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.button}
          >
            <View style={styles.buttonSheen} />
            <Text style={styles.buttonText}>{t("splash.cta")}</Text>
            <Text style={styles.buttonChevron}>›</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050016",
  },
  centralGlow: {
    position: "absolute",
    width: W * 1.1,
    height: W * 1.1,
    borderRadius: W,
    top: H * 0.1,
    left: -W * 0.05,
    backgroundColor: "transparent",
    shadowColor: "#7c3aed",
    shadowOpacity: 1,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 0 },
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  heroWrapper: {
    width: OUTER_R * 2,
    height: OUTER_R * 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  outerRing: {
    width: OUTER_R * 2,
    height: OUTER_R * 2,
    borderColor: "rgba(212,175,55,0.28)",
  },
  midRing: {
    width: MID_R * 2,
    height: MID_R * 2,
    borderColor: "rgba(212,175,55,0.18)",
  },
  innerRing: {
    width: INNER_R * 2,
    height: INNER_R * 2,
    borderColor: "rgba(212,175,55,0.35)",
  },
  zodiacGlyph: {
    position: "absolute",
    width: 24,
    height: 24,
    opacity: 0.75,
  },
  centerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(26,13,46,0.9)",
    borderWidth: 2,
    borderColor: "rgba(212,175,55,0.7)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  centerStar: {
    width: 120,
    height: 120,
    marginLeft: 2,
    marginTop: -2,
  },
  appName: {
    fontSize: 48,
    fontWeight: "300",
    color: "#d4af37",
    letterSpacing: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 13,
    color: "rgba(245,234,200,0.55)",
    letterSpacing: 2.5,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: "rgba(212,175,55,0.25)",
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
  },
  featureCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(212,175,55,0.07)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureCircleActive: {
    backgroundColor: "rgba(212,175,55,0.15)",
    borderColor: "rgba(212,175,55,0.85)",
    borderWidth: 1.5,
  },
  featureGlyph: {
    fontSize: 20,
    color: "rgba(212,175,55,0.6)",
  },
  featureGlyphActive: {
    color: "#d4af37",
  },
  featureLabel: {
    fontSize: 9,
    color: "rgba(245,234,200,0.4)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  featureLabelActive: {
    color: "rgba(212,175,55,0.85)",
  },
  featureDescCard: {
    backgroundColor: "rgba(212,175,55,0.05)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.18)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  featureDescTopLine: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: "rgba(212,175,55,0.35)",
  },
  featureDescLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(212,175,55,0.7)",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  featureDescText: {
    fontSize: 13,
    color: "rgba(230,208,150,0.78)",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 28,
    paddingTop: 16,
    backgroundColor: "transparent",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d4af37",
    borderRadius: 32,
    paddingVertical: 18,
    overflow: "hidden",
    shadowColor: "#d4af37",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  buttonSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  buttonText: {
    color: "#0f0920",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonChevron: {
    color: "#0f0920",
    fontSize: 24,
    fontWeight: "300",
    marginLeft: 8,
    lineHeight: 24,
  },
});
