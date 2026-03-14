import React from "react";
import { Svg, Circle, Line, Text, Image, G, Rect } from "react-native-svg";
import type { NatalChartData } from "../../../types/natalChart";
import { PLANET_SYMBOLS } from "../../../lib/natalChart";
import { ZODIAC_ASSETS } from "../../../lib/zodiacImageLoader";

const RING_COLOR = "#d4af37";
const RING_COLOR_DIM = "#8b6914";
const ACCENT_COLOR = "#ff69b4";
const BG_COLOR = "#1a0033";

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

interface Props {
  chartData: NatalChartData;
  size: number;
}

export default function NatalChartView({ chartData, size }: Props) {
  const center = size / 2;
  const zodiacInner = size * 0.36;
  const zodiacBandWidth = size * 0.12;
  const zodiacOuter = zodiacInner + zodiacBandWidth;
  const aspectInner = size * 0.28;
  const bodyRadius = zodiacInner - size * 0.1;
  const planetSymbolSize = Math.round(size * 0.055);
  const markerR = Math.max(8, Math.round(planetSymbolSize * 0.6));
  const degFontSize = Math.max(10, Math.round(planetSymbolSize * 0.5));
  const imgSize = Math.round(zodiacBandWidth * 0.8);
  const offset = chartData.angles.asc;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <Rect width={size} height={size} fill={BG_COLOR} />

      {/* Zodiac ring borders */}
      <Circle cx={center} cy={center} r={zodiacOuter} fill="none" stroke={RING_COLOR} strokeWidth={3} opacity={0.8} />
      <Circle cx={center} cy={center} r={zodiacOuter - 6} fill="none" stroke={RING_COLOR_DIM} strokeWidth={1} opacity={0.5} />
      <Circle cx={center} cy={center} r={zodiacInner} fill="none" stroke={RING_COLOR} strokeWidth={2} opacity={0.8} />

      {/* Ticks every 5°, major every 30° */}
      {Array.from({ length: 72 }, (_, idx) => {
        const deg = idx * 5;
        const isMajor = deg % 30 === 0;
        const tickStart = isMajor ? zodiacInner - 15 : zodiacOuter - 8;
        const p1 = polarToCartesian(center, center, tickStart, deg - offset);
        const p2 = polarToCartesian(center, center, zodiacOuter, deg - offset);
        return (
          <Line
            key={deg}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={RING_COLOR}
            strokeWidth={isMajor ? 2 : 0.8}
            opacity={isMajor ? 1 : 0.6}
          />
        );
      })}

      {/* Zodiac images */}
      {Array.from({ length: 12 }, (_, i) => {
        const pos = polarToCartesian(
          center, center,
          (zodiacOuter + zodiacInner) / 2,
          i * 30 + 15 - offset
        );
        return (
          <Image
            key={i}
            href={ZODIAC_ASSETS[i]}
            x={pos.x - imgSize / 2}
            y={pos.y - imgSize / 2}
            width={imgSize}
            height={imgSize}
            preserveAspectRatio="xMidYMid meet"
          />
        );
      })}

      {/* House cusps */}
      {chartData.houses.cusps.map((cusp, i) => {
        const isAngle = [0, 3, 6, 9].includes(i);
        const p1 = polarToCartesian(center, center, aspectInner, cusp - offset);
        const p2 = polarToCartesian(center, center, zodiacInner, cusp - offset);
        const numPos = polarToCartesian(center, center, aspectInner - 15, cusp + 15 - offset);
        return (
          <G key={i}>
            <Line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={isAngle ? ACCENT_COLOR : RING_COLOR_DIM}
              strokeWidth={isAngle ? 2 : 1}
              opacity={isAngle ? 0.9 : 0.5}
            />
            <Text
              x={numPos.x} y={numPos.y}
              fontSize={10} fill="#999"
              textAnchor="middle" alignmentBaseline="middle"
            >
              {i + 1}
            </Text>
          </G>
        );
      })}

      {/* Aspect lines */}
      {chartData.aspects.map((aspect, idx) => {
        const b1 = chartData.planets.find((p) => p.bodyKey === aspect.planet1);
        const b2 = chartData.planets.find((p) => p.bodyKey === aspect.planet2);
        if (!b1 || !b2) return null;
        const p1 = polarToCartesian(center, center, aspectInner - 15, b1.longitude - offset);
        const p2 = polarToCartesian(center, center, aspectInner - 15, b2.longitude - offset);
        const color = aspect.color === "red" ? "#ff69b4" : aspect.color === "blue" ? "#87ceeb" : "#888";
        const sw = aspect.orb < 1 ? 2.5 : aspect.orb < 3 ? 1.8 : 1;
        return (
          <Line key={idx} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={sw} opacity={0.7} />
        );
      })}

      {/* Planets */}
      {chartData.planets.map((planet, idx) => {
        const sym = PLANET_SYMBOLS[planet.bodyKey as keyof typeof PLANET_SYMBOLS];
        const p = polarToCartesian(center, center, bodyRadius, planet.longitude - offset);
        const degPos = polarToCartesian(center, center, bodyRadius + size * 0.055, planet.longitude - offset);
        return (
          <G key={idx}>
            <Circle cx={p.x} cy={p.y} r={markerR} fill={ACCENT_COLOR} opacity={0.3} />
            <Text
              x={p.x} y={p.y + 3}
              fontSize={planetSymbolSize} fontWeight="bold"
              fill={RING_COLOR} textAnchor="middle" alignmentBaseline="middle"
            >
              {sym?.symbol ?? planet.bodyKey.slice(0, 2)}
            </Text>
            <Text
              x={degPos.x} y={degPos.y}
              fontSize={degFontSize} fontWeight="bold"
              fill={RING_COLOR} textAnchor="middle" alignmentBaseline="middle"
            >
              {Math.floor(planet.longitude % 30)}°
            </Text>
          </G>
        );
      })}

      {/* Center dot */}
      <Circle cx={center} cy={center} r={3} fill={RING_COLOR} />
    </Svg>
  );
}
