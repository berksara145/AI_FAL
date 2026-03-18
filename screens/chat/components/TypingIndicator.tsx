import React from "react";
import { View, Text } from "react-native";
import { ActivityIndicator } from "react-native";
import { ChatColors } from "../../../utils/theme";

export default function TypingIndicator() {
  return (
    <View style={{ paddingHorizontal: 24, paddingVertical: 8, marginBottom: 4 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: ChatColors.typingColor,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontStyle: "italic",
          marginBottom: 4,
        }}
      >
        Lunara
      </Text>
      <ActivityIndicator size="small" color={ChatColors.typingColor} />
    </View>
  );
}
