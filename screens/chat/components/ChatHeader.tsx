import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChatColors } from "../../../utils/theme";
import { useTranslation } from "react-i18next";

type ChatHeaderProps = {
  title: string;
  onClose: () => void;
  mode?: "interactive" | "readonly";
};

export default function ChatHeader({ title, onClose, mode = "interactive" }: ChatHeaderProps) {
  const { t } = useTranslation();
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.06, duration: 1750, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 1,    duration: 1750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: ChatColors.headerBg,
        gap: 14,
        shadowColor: "#0c0818",
        shadowOpacity: 0.55,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.6} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={ChatColors.sendActive} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 21,
            fontWeight: "600",
            color: ChatColors.sendActive,
            letterSpacing: 0.5,
            textShadowColor: "rgba(201,168,76,0.35)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
          }} numberOfLines={1}>
            {title}
          </Text>
          {mode === "readonly" && (
            <Text style={{
              fontSize: 11,
              color: "rgba(201,168,76,0.5)",
              marginTop: 2,
              letterSpacing: 0.5,
            }}>
              {t("chat.readonlyBadge")}
            </Text>
          )}
        </View>

        {/* Pulsing heart icon */}
        <Animated.View style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: "#1e1248",
          borderWidth: 1.5,
          borderColor: "rgba(201,168,76,0.6)",
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: iconScale }],
        }}>
          <Text style={{ fontSize: 15, color: ChatColors.sendActive }}>♡</Text>
        </Animated.View>
      </View>

      {/* Gold divider */}
      <View style={{
        height: 1,
        backgroundColor: ChatColors.sendActive,
        opacity: 0.3,
      }} />
    </>
  );
}
