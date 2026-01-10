import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ExpectationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const features = [
    {
      icon: "zodiac-aries",
      title: "Daily Horoscope",
      description: "Get personalized daily insights based on your zodiac sign",
    },
    {
      icon: "cards",
      title: "Tarot Readings",
      description: "Receive AI-powered tarot card interpretations",
    },
    {
      icon: "account-heart",
      title: "Compatibility",
      description: "Check compatibility with friends, partners, and more",
    },
    {
      icon: "star-circle",
      title: "Big Three",
      description: "Discover your Sun, Moon, and Rising signs",
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
          What to Expect
        </Text>
        <Text className="text-base text-gray-600 mb-8 text-center">
          AI FAL offers a variety of mystical experiences
        </Text>

        {/* Features List */}
        <View className="mb-8">
          {features.map((feature, index) => (
            <View
              key={index}
              className="flex-row items-start mb-6 p-4 bg-purple-50 rounded-xl"
            >
              <View className="mr-4 mt-1">
                <MaterialCommunityIcons
                  name={feature.icon as any}
                  size={32}
                  color="#6200ee"
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {feature.title}
                </Text>
                <Text className="text-sm text-gray-600">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="px-6 py-3 rounded-full border-2 border-purple-600"
            activeOpacity={0.7}
          >
            <Text className="text-purple-600 font-semibold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("UserInfoChat")}
            className="px-6 py-3 rounded-full bg-purple-600"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
