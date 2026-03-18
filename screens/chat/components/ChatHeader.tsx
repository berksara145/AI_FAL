import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChatColors } from "../../../utils/theme";

type ChatHeaderProps = {
  title: string;
  onClose: () => void;
  mode?: "interactive" | "readonly";
};

export default function ChatHeader({ title, onClose, mode = "interactive" }: ChatHeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: ChatColors.headerBg,
        borderBottomWidth: 1,
        borderBottomColor: ChatColors.border,
      }}
    >
      <TouchableOpacity
        onPress={onClose}
        style={{
          padding: 8,
          marginRight: 12,
          opacity: 0.8,
        }}
        activeOpacity={0.5}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={ChatColors.lunaraLabel} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        {title ? (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "400",
              color: ChatColors.lunaraLabel,
              letterSpacing: 1,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
        {mode === "readonly" && (
          <Text style={{ fontSize: 12, color: ChatColors.typingColor, marginTop: 4 }}>
            Read Only
          </Text>
        )}
      </View>
    </View>
  );
}
