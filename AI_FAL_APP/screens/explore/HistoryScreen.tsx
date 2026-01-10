import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function HistoryScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">History</Text>
        <Text className="text-gray-600">History screen content coming soon...</Text>
      </View>
    </ScrollView>
  );
}
