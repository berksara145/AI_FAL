import React from "react";
import { View, Text } from "react-native";
import { ActivityIndicator } from "react-native";

export default function TypingIndicator() {
  return (
    <View style={{ paddingHorizontal: 24, paddingVertical: 8, marginBottom: 4 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: "rgba(212,175,55,0.5)",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontStyle: "italic",
          marginBottom: 4,
        }}
      >
        Lunara
      </Text>
      <ActivityIndicator size="small" color="rgba(212,175,55,0.6)" />
    </View>
  );
}
