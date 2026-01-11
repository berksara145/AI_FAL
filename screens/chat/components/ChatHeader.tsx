import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        backgroundColor: "#1a0d2e",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(212, 175, 55, 0.2)",
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
        <MaterialCommunityIcons name="arrow-left" size={24} color="#d4af37" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        {title ? (
          <Text 
            style={{
              fontSize: 18,
              fontWeight: "400",
              color: "#d4af37",
              letterSpacing: 1,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
        {mode === "readonly" && (
          <Text style={{ fontSize: 12, color: "rgba(212, 175, 55, 0.6)", marginTop: 4 }}>
            Read Only
          </Text>
        )}
      </View>
    </View>
  );
}
