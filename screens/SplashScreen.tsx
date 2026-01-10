import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getOrCreateUser } from "../db/user.repo";

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Initialize/create user on mount (empty user with only ID)
  useEffect(() => {
    const initializeUser = async () => {
      try {
        await getOrCreateUser();
        console.log("User initialized in SplashScreen");
      } catch (error) {
        console.error("Error initializing user in SplashScreen:", error);
      }
    };
    initializeUser();
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: "#6366f1" }}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingVertical: 40, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          {/* Main Logo/Icon */}
          <View className="mb-8 mt-8">
            <MaterialCommunityIcons name="crystal-ball" size={140} color="#ffffff" />
          </View>

          {/* App Title */}
          <Text className="text-5xl font-bold text-white text-center mb-3">
            AI FAL
          </Text>
          <Text className="text-2xl text-white/90 text-center mb-12">
            Your AI Fortune Teller
          </Text>

          {/* Feature Highlights */}
          <View className="w-full mb-12">
            <View className="flex-row items-center mb-6">
              <MaterialCommunityIcons name="star-circle" size={32} color="#ffffff" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-white mb-1">
                  Daily Horoscope
                </Text>
                <Text className="text-sm text-white/80">
                  Get personalized daily insights
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-6">
              <MaterialCommunityIcons name="cards" size={32} color="#ffffff" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-white mb-1">
                  Tarot Readings
                </Text>
                <Text className="text-sm text-white/80">
                  AI-powered tarot card interpretations
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-6">
              <MaterialCommunityIcons name="account-group" size={32} color="#ffffff" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-white mb-1">
                  Compatibility Check
                </Text>
                <Text className="text-sm text-white/80">
                  Discover relationship insights
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <MaterialCommunityIcons name="zodiac-aries" size={32} color="#ffffff" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-white mb-1">
                  Big Three Analysis
                </Text>
                <Text className="text-sm text-white/80">
                  Sun, Moon & Rising signs
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-8 pt-4" style={{ backgroundColor: "#6366f1" }}>
        <TouchableOpacity
          onPress={() => navigation.replace("UserInfoChat")}
          className="bg-white rounded-full px-8 py-4 items-center shadow-lg"
          activeOpacity={0.8}
        >
          <Text className="text-purple-600 text-lg font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
