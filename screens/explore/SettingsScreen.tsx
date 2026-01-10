import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Settings</Text>
        <Text className="text-gray-600">Settings screen content coming soon...</Text>
      </View>
    </ScrollView>
  );
}
