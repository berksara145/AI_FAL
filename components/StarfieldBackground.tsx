import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Animated as RNAnimated } from "react-native";
import Svg, {
  Defs,
  RadialGradient as SvgGradient,
  Stop,
  Rect,
  Line as SvgLine,
  Circle as SvgCircle,
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

export const STARS = Array.from({ length: 90 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  return {
    x: (((seed * 1.3) % 233280) / 233280) * W,
    y: (((seed * 2.7) % 233280) / 233280) * H,
    size: 0.8 + ((seed % 4) * 0.55),
    opacity: 0.12 + ((seed % 7) / 7) * 0.5,
  };
});

export const TWINKLE_STARS = Array.from({ length: 18 }, (_, i) => {
  const seed = (i * 6271 + 13337) % 233280;
  return {
    x: (((seed * 1.9) % 233280) / 233280) * W,
    y: (((seed * 3.3) % 233280) / 233280) * H,
    size: 1.4 + ((seed % 3) * 0.7),
  };
});

export const CONSTELLATIONS = [
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

export const SHOOT_CONFIGS = [
  { sx: W * 0.08, sy: H * 0.04, dx: W * 0.32, dy: H * 0.20, period: 11000, offset: 1200 },
  { sx: W * 0.52, sy: H * 0.01, dx: W * 0.28, dy: H * 0.18, period: 15000, offset: 5500 },
  { sx: W * 0.01, sy: H * 0.33, dx: W * 0.26, dy: H * 0.16, period: 18000, offset: 9000 },
];

// Gradient IDs must be unique per SVG instance — pass a prefix to avoid collisions
type Props = { idPrefix?: string };

export default function StarfieldBackground({ idPrefix = "sf" }: Props) {
  const twinkleAnims = useRef(TWINKLE_STARS.map(() => new RNAnimated.Value(0.25))).current;
  const shootAnims   = useRef(SHOOT_CONFIGS.map(() => new RNAnimated.Value(0))).current;

  useEffect(() => {
    twinkleAnims.forEach((anim, i) => {
      const dur = 1500 + (i * 373 % 1400);
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(i * 260),
          RNAnimated.timing(anim, { toValue: 1,   duration: dur, useNativeDriver: true }),
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
            RNAnimated.timing(anim, { toValue: 1, duration: 800,          useNativeDriver: true }),
            RNAnimated.timing(anim, { toValue: 0, duration: 200,          useNativeDriver: true }),
            RNAnimated.delay(period - 1000),
          ])
        ).start();
      }, offset);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Nebula + constellations */}
      <Svg style={StyleSheet.absoluteFill} width={W} height={H} pointerEvents="none">
        <Defs>
          <SvgGradient id={`${idPrefix}neb1`} cx={W * 0.45} cy={H * 0.16} r={W * 0.58} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.30" />
            <Stop offset="55%"  stopColor="#4c1d95" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id={`${idPrefix}neb2`} cx={W * 0.92} cy={H * 0.45} r={W * 0.48} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#1e3a8a" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#1e3a8a" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id={`${idPrefix}neb3`} cx={W * 0.5}  cy={H * 0.95} r={W * 0.55} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#92400e" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#92400e" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id={`${idPrefix}neb4`} cx={W * 0.10} cy={H * 0.75} r={W * 0.38} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#5b21b6" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#5b21b6" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id={`${idPrefix}neb5`} cx={W * 0.88} cy={H * 0.09} r={W * 0.28} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#0e7490" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#0e7490" stopOpacity="0"    />
          </SvgGradient>
          <SvgGradient id={`${idPrefix}neb6`} cx={W * 0.05} cy={H * 0.42} r={W * 0.30} gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#9d174d" stopOpacity="0.11" />
            <Stop offset="100%" stopColor="#9d174d" stopOpacity="0"    />
          </SvgGradient>
        </Defs>
        <Rect width={W} height={H} fill={`url(#${idPrefix}neb1)`} />
        <Rect width={W} height={H} fill={`url(#${idPrefix}neb2)`} />
        <Rect width={W} height={H} fill={`url(#${idPrefix}neb3)`} />
        <Rect width={W} height={H} fill={`url(#${idPrefix}neb4)`} />
        <Rect width={W} height={H} fill={`url(#${idPrefix}neb5)`} />
        <Rect width={W} height={H} fill={`url(#${idPrefix}neb6)`} />
        {CONSTELLATIONS.flatMap(({ nodes, edges }, ci) =>
          edges.map(([a, b], ei) => (
            <SvgLine
              key={`${idPrefix}-l-${ci}-${ei}`}
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
              key={`${idPrefix}-n-${ci}-${ni}`}
              cx={n.x * W} cy={n.y * H}
              r="1.8"
              fill="rgba(212,175,55,0.55)"
            />
          ))
        )}
      </Svg>

      {/* Static stars */}
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

      {/* Twinkling stars */}
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

      {/* Shooting stars */}
      {SHOOT_CONFIGS.map(({ sx, sy, dx, dy }, i) => {
        const progress = shootAnims[i];
        const tX      = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
        const tY      = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
        const opacity = progress.interpolate({
          inputRange:  [0, 0.05, 0.65, 1],
          outputRange: [0, 0.85, 0.2,  0],
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
  );
}
