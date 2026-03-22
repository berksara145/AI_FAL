import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
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

const { width: W, height: H } = Dimensions.get("window");

// Deterministic star field — same positions every render
const STARS = Array.from({ length: 55 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  return {
    x: (((seed * 1.3) % 233280) / 233280) * W,
    y: (((seed * 2.7) % 233280) / 233280) * H,
    size: 1 + ((seed % 3) * 0.7),
    opacity: 0.18 + ((seed % 7) / 7) * 0.55,
  };
});

const ZODIAC_GLYPHS = [
  { glyph: "♈", angle: -40 },
  { glyph: "♋", angle: 50 },
  { glyph: "♎", angle: 140 },
  { glyph: "♑", angle: 230 },
];

const OUTER_R = 130;
const MID_R   = 90;
const INNER_R = 56;

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  // Button press scale
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Slow rotation for outer ring
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // Fade-in for whole screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Center pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getOrCreateUser().catch(() => {});

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 900, useNativeDriver: true,
    }).start();

    // Outer ring slow rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, duration: 28000, useNativeDriver: true,
      })
    ).start();

    // Center glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 30 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#050016" />

      {/* Star field */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {STARS.map((s, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              borderRadius: s.size,
              backgroundColor: "#fff",
              opacity: s.opacity,
            }}
          />
        ))}
      </View>

      {/* Radial purple glow behind hero */}
      <View style={styles.centralGlow} pointerEvents="none" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* ── Orbital hero ── */}
        <View style={styles.heroWrapper}>

          {/* Outer ring (rotating) with zodiac glyphs on it */}
          <Animated.View style={[styles.ring, styles.outerRing, { transform: [{ rotate }] }]}>
            {ZODIAC_GLYPHS.map(({ glyph, angle }) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <Text
                  key={glyph}
                  style={[
                    styles.zodiacGlyph,
                    {
                      left: OUTER_R + Math.cos(rad) * OUTER_R - 10,
                      top:  OUTER_R + Math.sin(rad) * OUTER_R - 10,
                    },
                  ]}
                >
                  {glyph}
                </Text>
              );
            })}
          </Animated.View>

          {/* Mid ring (static) */}
          <View style={[styles.ring, styles.midRing]} />

          {/* Inner ring */}
          <View style={[styles.ring, styles.innerRing]} />

          {/* Center glow + star */}
          <Animated.View style={[styles.centerGlow, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.centerCircle}>
            <Text style={styles.centerStar}>✦</Text>
          </View>

        </View>

        {/* ── App name ── */}
        <Text style={styles.appName}>AI FAL</Text>
        <Text style={styles.tagline}>Read the stars. Know yourself.</Text>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Feature trio ── */}
        <View style={styles.featureRow}>
          {[
            { glyph: "☽", label: "Birth Chart" },
            { glyph: "✦", label: "Tarot" },
            { glyph: "♡", label: "Compatibility" },
          ].map(({ glyph, label }) => (
            <View key={label} style={styles.featureItem}>
              <Text style={styles.featureGlyph}>{glyph}</Text>
              <Text style={styles.featureLabel}>{label}</Text>
            </View>
          ))}
        </View>

      </Animated.View>

      {/* ── Fixed CTA ── */}
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom + 12, 32) }]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={() => navigation.replace("UserInfoChat")}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.button}
          >
            <View style={styles.buttonSheen} />
            <Text style={styles.buttonText}>Begin Your Journey</Text>
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
    // Android fallback: subtle bg
    // eslint-disable-next-line react-native/no-color-literals
    ...({ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)" } as any),
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },

  // ── Orbital rings ──
  heroWrapper: {
    width: OUTER_R * 2,
    height: OUTER_R * 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
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
    fontSize: 15,
    color: "rgba(212,175,55,0.75)",
    width: 20,
    textAlign: "center",
  },
  centerGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(124,58,237,0.22)",
    shadowColor: "#c9a84c",
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  centerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(26,13,46,0.9)",
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerStar: {
    fontSize: 20,
    color: "#d4af37",
  },

  // ── Text ──
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
    marginBottom: 36,
  },

  divider: {
    width: 60,
    height: 1,
    backgroundColor: "rgba(212,175,55,0.25)",
    marginBottom: 32,
  },

  // ── Feature trio ──
  featureRow: {
    flexDirection: "row",
    gap: 32,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
  },
  featureGlyph: {
    fontSize: 22,
    color: "rgba(212,175,55,0.7)",
  },
  featureLabel: {
    fontSize: 10,
    color: "rgba(245,234,200,0.45)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── Button ──
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
