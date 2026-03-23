import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import Svg, {
  Circle,
  Line,
  Ellipse,
  Rect,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

// ── Deterministic pseudo-random ──────────────────────────────────────────────
function prand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Star data (split into 6 flicker groups) ──────────────────────────────────
const ALL_STARS = Array.from({ length: 126 }, (_, i) => ({
  x: prand(i * 127.1) * W,
  y: prand(i * 311.7) * H * 0.78,
  r: prand(i * 74.3) * 1.3 + 0.3,
  op: prand(i * 159.9) * 0.55 + 0.18,
  isCross: i % 21 === 0,
  cs: prand(i * 91.2) * 5.5 + 3,
}));
// 6 groups of 21 stars each
const STAR_GROUPS = Array.from({ length: 6 }, (_, g) =>
  ALL_STARS.filter((_, i) => i % 6 === g)
);

// ── Constellation data ────────────────────────────────────────────────────────
const CONSTELLATIONS = [
  { pts: [[75, 110], [145, 82], [208, 105], [178, 168], [108, 185]], color: "#C9A84C" },
  { pts: [[272, 52], [338, 72], [368, 138], [322, 178], [258, 150]], color: "#9B7EC8" },
  { pts: [[38, 295], [105, 265], [134, 318], [92, 380]], color: "#C9A84C" },
];

// ── ShootingStar ─────────────────────────────────────────────────────────────
interface ShootingStarProps {
  id: string;
  startX: number;
  startY: number;
  angleDeg: number;
  delay: number;
  interval: number;
}

function ShootingStar({ id, startX, startY, angleDeg, delay, interval }: ShootingStarProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const TRAIL = 88;
  const TRAVEL = W * 1.55;
  const rad = (angleDeg * Math.PI) / 180;

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      progress.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, { toValue: 1, duration: 680, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished && !cancelled) setTimeout(run, interval + prand(delay * 7) * 2800);
      });
    };
    const t = setTimeout(run, 0);
    return () => { cancelled = true; clearTimeout(t); progress.stopAnimation(); };
  }, []);

  const tx = progress.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL * Math.cos(rad)] });
  const ty = progress.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL * Math.sin(rad)] });
  const op = progress.interpolate({ inputRange: [0, 0.14, 0.78, 1], outputRange: [0, 1, 0.85, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: startX - TRAIL,
        top: startY - 5,
        width: TRAIL + 10,
        height: 10,
        opacity: op,
        transform: [{ translateX: tx }, { translateY: ty }],
      }}
    >
      <Svg width={TRAIL + 10} height={10}>
        <Defs>
          {/* gradientUnits="userSpaceOnUse" so it spans the actual pixel rect */}
          <LinearGradient id={`st-${id}`} x1="0" y1="5" x2={TRAIL} y2="5" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
            <Stop offset="60%" stopColor="#E8C97A" stopOpacity="0.72" />
            <Stop offset="100%" stopColor="#FFF8D0" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Trail */}
        <Rect x="0" y="3.5" width={TRAIL} height="3" fill={`url(#st-${id})`} rx="1.5" />
        {/* Head glow */}
        <Circle cx={TRAIL + 4} cy="5" r="5" fill="#E8C97A" opacity="0.22" />
        {/* Head core */}
        <Circle cx={TRAIL + 4} cy="5" r="2.5" fill="#FFF8D0" opacity="0.95" />
      </Svg>
    </Animated.View>
  );
}

// ── Cloud ────────────────────────────────────────────────────────────────────
interface CloudProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  dir: 1 | -1;
}

function Cloud({ id, x, y, w, h, delay, dir }: CloudProps) {
  const drift = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 2200, delay, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: dir * 52, duration: 22000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 22000, useNativeDriver: true }),
      ])
    );
    const t = setTimeout(() => loop.start(), delay);
    return () => { clearTimeout(t); loop.stop(); };
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity, transform: [{ translateX: drift }] }}
    >
      <Svg width={w} height={h}>
        <Defs>
          <RadialGradient id={`cg-${id}`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <Stop offset="0%"   stopColor="#B08040" stopOpacity="0.38" />
            <Stop offset="35%"  stopColor="#7A5828" stopOpacity="0.2" />
            <Stop offset="68%"  stopColor="#122032" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#0A1E37" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={`url(#cg-${id})`} />
      </Svg>
    </Animated.View>
  );
}

// ── BackgroundScene ───────────────────────────────────────────────────────────
export default function BackgroundScene() {
  // 6 independent flicker animations for star groups
  const flickerAnims = useRef(
    Array.from({ length: 6 }, (_, i) => new Animated.Value(i % 2 === 0 ? 0.65 : 1))
  ).current;

  useEffect(() => {
    flickerAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 550 + prand(i * 13) * 700),
          Animated.timing(anim, { toValue: 0.28, duration: 900 + i * 280, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 1300 + i * 190, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* ── Nebula + constellation static SVG ────────── */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="neb-blue" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <Stop offset="0%"   stopColor="#0F3278" stopOpacity="0.5" />
            <Stop offset="55%"  stopColor="#071428" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#071428" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="neb-purple" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <Stop offset="0%"   stopColor="#501EA0" stopOpacity="0.32" />
            <Stop offset="52%"  stopColor="#320F64" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#320F64" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="neb-violet" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <Stop offset="0%"   stopColor="#6E1EA0" stopOpacity="0.24" />
            <Stop offset="58%"  stopColor="#3A0F50" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#3A0F50" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="neb-teal" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <Stop offset="0%"   stopColor="#0A5064" stopOpacity="0.22" />
            <Stop offset="65%"  stopColor="#0A5064" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#0A5064" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Nebula blobs — ellipses with radial gradients, no hard edges */}
        <Ellipse cx={-30}     cy={100}      rx={300} ry={240} fill="url(#neb-blue)"   />
        <Ellipse cx={W * 0.6} cy={H * 0.28} rx={320} ry={300} fill="url(#neb-purple)" />
        <Ellipse cx={W + 30}  cy={H * 0.72} rx={260} ry={220} fill="url(#neb-violet)" />
        <Ellipse cx={50}      cy={H * 0.62} rx={180} ry={150} fill="url(#neb-teal)"   />

        {/* Constellation lines */}
        {CONSTELLATIONS.map((c, gi) =>
          c.pts.slice(0, -1).map((pt, i) => (
            <Line
              key={`cl-${gi}-${i}`}
              x1={pt[0]} y1={pt[1]}
              x2={c.pts[i + 1][0]} y2={c.pts[i + 1][1]}
              stroke={c.color} strokeWidth="0.6" strokeDasharray="3,5" opacity="0.18"
            />
          ))
        )}
        {CONSTELLATIONS.map((c, gi) =>
          c.pts.map((pt, i) => (
            <G key={`cd-${gi}-${i}`}>
              <Circle cx={pt[0]} cy={pt[1]} r={4} fill={c.color} opacity="0.1" />
              <Circle cx={pt[0]} cy={pt[1]} r={1.6} fill={c.color} opacity="0.25" />
            </G>
          ))
        )}
      </Svg>

      {/* ── Sun burst — top right (RadialGradient glow) ── */}
      <Svg
        style={{ position: "absolute", top: -50, right: -25, width: 250, height: 250 }}
        viewBox="0 0 250 250"
        pointerEvents="none"
      >
        <Defs>
          {/* Outer halo — radial so it fades in all directions */}
          <RadialGradient id="sun-halo" cx="66%" cy="28%" r="38%" gradientUnits="objectBoundingBox">
            <Stop offset="0%"   stopColor="#E8C97A" stopOpacity="0.55" />
            <Stop offset="32%"  stopColor="#C9A84C" stopOpacity="0.22" />
            <Stop offset="65%"  stopColor="#C9A84C" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </RadialGradient>
          {/* Core glow */}
          <RadialGradient id="sun-core" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <Stop offset="0%"   stopColor="#FFF6C0" stopOpacity="1" />
            <Stop offset="55%"  stopColor="#E8C97A" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Wide fading halo */}
        <Rect x="0" y="0" width="250" height="250" fill="url(#sun-halo)" />

        {/* Core disc */}
        <Circle cx={165} cy={70} r={22} fill="url(#sun-core)" />

        {/* Long rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <Line
              key={`lr-${deg}`}
              x1={165 + Math.cos(r) * 26} y1={70 + Math.sin(r) * 26}
              x2={165 + Math.cos(r) * 62} y2={70 + Math.sin(r) * 62}
              stroke="#C9A84C" strokeWidth="1.1" opacity="0.5"
            />
          );
        })}
        {/* Short rays */}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <Line
              key={`sr-${deg}`}
              x1={165 + Math.cos(r) * 26} y1={70 + Math.sin(r) * 26}
              x2={165 + Math.cos(r) * 42} y2={70 + Math.sin(r) * 42}
              stroke="#C9A84C" strokeWidth="0.6" opacity="0.28"
            />
          );
        })}
      </Svg>

      {/* ── Flickering star groups (each Animated.View pulses independently) ── */}
      {STAR_GROUPS.map((group, gi) => (
        <Animated.View
          key={`sg-${gi}`}
          style={[StyleSheet.absoluteFill, { opacity: flickerAnims[gi] }]}
          pointerEvents="none"
        >
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {group.map((s, si) =>
              s.isCross ? (
                <G key={`gs-${si}`}>
                  <Line x1={s.x} y1={s.y - s.cs} x2={s.x} y2={s.y + s.cs}
                    stroke="#E8C97A" strokeWidth="0.75" opacity={s.op * 0.85} />
                  <Line x1={s.x - s.cs} y1={s.y} x2={s.x + s.cs} y2={s.y}
                    stroke="#E8C97A" strokeWidth="0.75" opacity={s.op * 0.85} />
                  <Circle cx={s.x} cy={s.y} r={1.3} fill="#FFF8D0" opacity={s.op} />
                </G>
              ) : (
                <Circle
                  key={`gs-${si}`}
                  cx={s.x} cy={s.y} r={s.r}
                  fill={si % 3 === 0 ? "#B8C8FF" : "#EBDAAA"}
                  opacity={s.op}
                />
              )
            )}
          </Svg>
        </Animated.View>
      ))}

      {/* ── Shooting stars ────────────────────────────── */}
      <ShootingStar id="a" startX={-60}      startY={H * 0.11} angleDeg={33} delay={1400} interval={5200} />
      <ShootingStar id="b" startX={W * 0.25} startY={-15}      angleDeg={44} delay={4100} interval={6400} />
      <ShootingStar id="c" startX={-80}      startY={H * 0.21} angleDeg={28} delay={8000} interval={7800} />

      {/* ── Clouds ────────────────────────────────────── */}
      <Cloud id="1" x={-90}       y={H * 0.50} w={340} h={150} delay={600}  dir={1}  />
      <Cloud id="2" x={W - 210}   y={H * 0.66} w={300} h={130} delay={2100} dir={-1} />
      <Cloud id="3" x={W * 0.08}  y={H * 0.76} w={260} h={115} delay={3600} dir={1}  />
      <Cloud id="4" x={W * 0.42}  y={H * 0.60} w={280} h={120} delay={1300} dir={-1} />
    </View>
  );
}
