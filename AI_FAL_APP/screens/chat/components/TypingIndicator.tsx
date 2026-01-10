import React from "react";
import { View, Text } from "react-native";
import { ActivityIndicator } from "react-native";

export default function TypingIndicator() {
  return (
    <View className="flex-row items-center px-4 py-2 mb-2">
      <View className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#6200ee" />
          <Text className="text-gray-500 text-sm ml-2">AI is typing...</Text>
        </View>
      </View>
    </View>
  );
}
