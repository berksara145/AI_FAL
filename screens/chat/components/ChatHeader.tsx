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
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
          {title}
        </Text>
        {mode === "readonly" && (
          <Text className="text-xs text-gray-500 mt-1">Read Only</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={onClose}
        className="p-2 ml-4"
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="close" size={24} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}
