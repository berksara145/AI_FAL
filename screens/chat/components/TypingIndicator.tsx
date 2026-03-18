import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { ChatColors } from "../../../utils/theme";

function PulsingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.2)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim,  { toValue: 0.85, duration: 400, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.25, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(anim,  { toValue: 0.2, duration: 400, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.8, duration: 400, useNativeDriver: true }),
        ]),
        Animated.delay(600 - delay),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      width: 6, height: 6,
      borderRadius: 3,
      backgroundColor: ChatColors.sendActive,
      opacity: anim,
      transform: [{ scale }],
    }} />
  );
}

export default function TypingIndicator() {
  return (
    <View style={{
      paddingHorizontal: 22,
      paddingBottom: 10,
      backgroundColor: ChatColors.bg,
    }}>
      {/* Sender label */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <View style={{
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: ChatColors.sendActive,
          shadowColor: "#c9a84c", shadowOpacity: 0.7, shadowRadius: 4,
        }} />
        <Text style={{
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 1.8,
          textTransform: "uppercase",
          color: ChatColors.lunaraLabel,
        }}>
          Lunara
        </Text>
      </View>

      {/* 3 dots */}
      <View style={{ flexDirection: "row", gap: 5, paddingLeft: 13 }}>
        <PulsingDot delay={0} />
        <PulsingDot delay={200} />
        <PulsingDot delay={400} />
      </View>
    </View>
  );
}
