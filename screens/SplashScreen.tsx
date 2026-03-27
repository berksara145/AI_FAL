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
import Svg, {
  Defs,
  RadialGradient as SvgGradient,
  Stop,
  Rect,
  Line as SvgLine,
  Circle as SvgCircle,
} from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { getOrCreateUser } from "../db/user.repo";
import { useTranslation } from "react-i18next";

const { width: W, height: H } = Dimensions.get("window");

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

// ── Twinkling stars (separate, animated) ──
const TWINKLE_STARS = Array.from({ length: 18 }, (_, i) => {
  const seed = (i * 6271 + 13337) % 233280;
  return {
    x: (((seed * 1.9) % 233280) / 233280) * W,
    y: (((seed * 3.3) % 233280) / 233280) * H,
    size: 1.4 + ((seed % 3) * 0.7),
  };
});

// ── Constellation patterns (screen-relative 0-1 coords) ──
const CONSTELLATIONS = [
  // Upper-left
  {
    nodes: [{ x: 0.06, y: 0.05 }, { x: 0.14, y: 0.10 }, { x: 0.09, y: 0.17 }, { x: 0.18, y: 0.21 }],
    edges: [[0, 1], [1, 2], [2, 3]],
  },
  // Upper-right
  {
    nodes: [{ x: 0.83, y: 0.04 }, { x: 0.91, y: 0.09 }, { x: 0.86, y: 0.16 }, { x: 0.94, y: 0.20 }],
    edges: [[0, 1], [1, 2], [2, 3]],
  },
  // Lower-left
  {
    nodes: [{ x: 0.04, y: 0.69 }, { x: 0.11, y: 0.75 }, { x: 0.06, y: 0.83 }, { x: 0.13, y: 0.88 }],
    edges: [[0, 1], [1, 2], [2, 3]],
  },
  // Lower-right
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
  const descOpacity  = useRef(new Animated.Value(1)).current;
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const rotateAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim     = useRef(new Animated.Value(0)).current;

  // Twinkling animations
  const twinkleAnims = useRef(
    TWINKLE_STARS.map(() => new Animated.Value(0.25))
  ).current;

  // Shooting star animations
  const shootAnims = useRef(
    SHOOT_CONFIGS.map(() => new Animated.Value(0))
  ).current;

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

    // Twinkling stars
    twinkleAnims.forEach((anim, i) => {
      const dur = 1500 + (i * 373 % 1400);
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 260),
          Animated.timing(anim, { toValue: 1,    duration: dur, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.1,  duration: dur, useNativeDriver: true }),
        ])
      ).start();
    });

    // Shooting stars
    shootAnims.forEach((anim, i) => {
      const { period, offset } = SHOOT_CONFIGS[i];
      const run = () => {
        anim.setValue(0);
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 800,  useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 200,  useNativeDriver: true }),
            Animated.delay(period - 1000),
          ])
        ).start();
      };
      const t = setTimeout(run, offset);
      return () => clearTimeout(t);
    });

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

      {/* ── Nebula + constellation SVG layer ── */}
      <Svg style={StyleSheet.absoluteFill} width={W} height={H} pointerEvents="none">
        <Defs>
          {/* Purple — upper-center */}
          <SvgGradient id="neb1" cx={W * 0.45} cy={H * 0.16} r={W * 0.58} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.30" />
            <Stop offset="55%"  stopColor="#4c1d95" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0"    />
          </SvgGradient>
          {/* Indigo — right */}
          <SvgGradient id="neb2" cx={W * 0.92} cy={H * 0.45} r={W * 0.48} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#1e3a8a" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#1e3a8a" stopOpacity="0"    />
          </SvgGradient>
          {/* Amber — bottom */}
          <SvgGradient id="neb3" cx={W * 0.5} cy={H * 0.95} r={W * 0.55} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#92400e" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#92400e" stopOpacity="0"    />
          </SvgGradient>
          {/* Violet — lower-left */}
          <SvgGradient id="neb4" cx={W * 0.10} cy={H * 0.75} r={W * 0.38} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#5b21b6" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#5b21b6" stopOpacity="0"    />
          </SvgGradient>
          {/* Teal — upper-right accent */}
          <SvgGradient id="neb5" cx={W * 0.88} cy={H * 0.09} r={W * 0.28} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#0e7490" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#0e7490" stopOpacity="0"    />
          </SvgGradient>
          {/* Rose — mid-left accent */}
          <SvgGradient id="neb6" cx={W * 0.05} cy={H * 0.42} r={W * 0.30} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#9d174d" stopOpacity="0.11" />
            <Stop offset="100%" stopColor="#9d174d" stopOpacity="0"    />
          </SvgGradient>
        </Defs>

        {/* Nebula fills */}
        <Rect width={W} height={H} fill="url(#neb1)" />
        <Rect width={W} height={H} fill="url(#neb2)" />
        <Rect width={W} height={H} fill="url(#neb3)" />
        <Rect width={W} height={H} fill="url(#neb4)" />
        <Rect width={W} height={H} fill="url(#neb5)" />
        <Rect width={W} height={H} fill="url(#neb6)" />

        {/* Constellation lines */}
        {CONSTELLATIONS.flatMap(({ nodes, edges }, ci) =>
          edges.map(([a, b], ei) => (
            <SvgLine
              key={`l-${ci}-${ei}`}
              x1={nodes[a].x * W} y1={nodes[a].y * H}
              x2={nodes[b].x * W} y2={nodes[b].y * H}
              stroke="rgba(212,175,55,0.22)"
              strokeWidth="0.6"
            />
          ))
        )}

        {/* Constellation nodes */}
        {CONSTELLATIONS.flatMap(({ nodes }, ci) =>
          nodes.map((n, ni) => (
            <SvgCircle
              key={`n-${ci}-${ni}`}
              cx={n.x * W} cy={n.y * H}
              r="1.8"
              fill="rgba(212,175,55,0.55)"
            />
          ))
        )}
      </Svg>

      {/* ── Static star field ── */}
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
          <Animated.View
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
          const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
          const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
          const opacity    = progress.interpolate({
            inputRange: [0, 0.05, 0.65, 1],
            outputRange: [0, 0.85, 0.2, 0],
          });
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                left: sx, top: sy,
                width: 55, height: 1.5,
                borderRadius: 1,
                backgroundColor: "rgba(255,248,220,0.95)",
                opacity,
                transform: [{ translateX }, { translateY }, { rotate: `${angle}deg` }],
              }}
            />
          );
        })}
      </View>

      {/* ── Radial purple glow (existing, kept for hero area) ── */}
      <View style={styles.centralGlow} pointerEvents="none" />

      {/* ── Main content ── */}
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

        {/* Divider */}
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

  // ── Orbital rings ──
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
    marginBottom: 24,
  },

  divider: {
    width: 60,
    height: 1,
    backgroundColor: "rgba(212,175,55,0.25)",
    marginBottom: 24,
  },

  // ── Feature circles ──
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

  // ── Feature description card ──
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
