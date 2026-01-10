import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1" style={{ backgroundColor: "#6366f1" }}>
      <View className="flex-1 items-center justify-center px-6">
        {/* Icon/Logo */}
        <View className="mb-8">
          <MaterialCommunityIcons name="crystal-ball" size={120} color="#ffffff" />
        </View>

        {/* Welcome Text */}
        <Text className="text-4xl font-bold text-white text-center mb-4">
          Welcome to AI FAL
        </Text>
        <Text className="text-xl text-white/90 text-center mb-2">
          Your Personal AI Fortune Teller
        </Text>
        <Text className="text-base text-white/80 text-center mb-12 px-4">
          Discover your future through AI-powered astrology, tarot readings, and personalized insights.
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Expectation")}
          className="bg-white rounded-full px-8 py-4 min-w-[200px] items-center shadow-lg"
          activeOpacity={0.8}
        >
          <Text className="text-purple-600 text-lg font-semibold">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
