import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1" style={{ backgroundColor: "#1a1a2e" }}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingVertical: 60, paddingHorizontal: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          {/* Decorative Top Line */}
          <View 
            style={{ 
              width: 60, 
              height: 2, 
              backgroundColor: "#d4af37", 
              marginBottom: 30,
              opacity: 0.8
            }} 
          />

          {/* Main Title - Theatre Script Style */}
          <Text 
            style={{
              fontSize: 64,
              fontWeight: "300",
              color: "#d4af37",
              textAlign: "center",
              marginBottom: 8,
              letterSpacing: 8,
              fontStyle: "italic",
            }}
          >
            AI FAL
          </Text>

          {/* Subtitle */}
          <Text 
            style={{
              fontSize: 18,
              fontWeight: "400",
              color: "#e5e5e5",
              textAlign: "center",
              marginBottom: 40,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            A Performance in Divination
          </Text>

          {/* Decorative Divider */}
          <View 
            style={{ 
              width: 120, 
              height: 1, 
              backgroundColor: "#d4af37", 
              marginBottom: 50,
              opacity: 0.6
            }} 
          />

          {/* Main Icon */}
          <View className="mb-12">
            <MaterialCommunityIcons name="crystal-ball" size={100} color="#d4af37" />
          </View>

          {/* Cast of Features - Theatre Playbill Style */}
          <View className="w-full mb-16">
            <Text 
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#d4af37",
                textAlign: "center",
                marginBottom: 30,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Featuring
            </Text>

            {/* Feature Items - Script Style */}
            <View className="items-center mb-8">
              <Text 
                style={{
                  fontSize: 24,
                  fontWeight: "400",
                  color: "#ffffff",
                  textAlign: "center",
                  marginBottom: 4,
                  letterSpacing: 2,
                  fontStyle: "italic",
                }}
              >
                Daily Horoscope
              </Text>
              <Text 
                style={{
                  fontSize: 13,
                  fontWeight: "300",
                  color: "#b8b8b8",
                  textAlign: "center",
                  letterSpacing: 1,
                  fontStyle: "italic",
                }}
              >
                Personalized celestial insights
              </Text>
            </View>

            <View 
              style={{ 
                width: 80, 
                height: 1, 
                backgroundColor: "#d4af37", 
                marginVertical: 20,
                opacity: 0.3
              }} 
            />

            <View className="items-center mb-8">
              <Text 
                style={{
                  fontSize: 24,
                  fontWeight: "400",
                  color: "#ffffff",
                  textAlign: "center",
                  marginBottom: 4,
                  letterSpacing: 2,
                  fontStyle: "italic",
                }}
              >
                Tarot Readings
              </Text>
              <Text 
                style={{
                  fontSize: 13,
                  fontWeight: "300",
                  color: "#b8b8b8",
                  textAlign: "center",
                  letterSpacing: 1,
                  fontStyle: "italic",
                }}
              >
                Mystical card interpretations
              </Text>
            </View>

            <View 
              style={{ 
                width: 80, 
                height: 1, 
                backgroundColor: "#d4af37", 
                marginVertical: 20,
                opacity: 0.3
              }} 
            />

            <View className="items-center mb-8">
              <Text 
                style={{
                  fontSize: 24,
                  fontWeight: "400",
                  color: "#ffffff",
                  textAlign: "center",
                  marginBottom: 4,
                  letterSpacing: 2,
                  fontStyle: "italic",
                }}
              >
                Compatibility
              </Text>
              <Text 
                style={{
                  fontSize: 13,
                  fontWeight: "300",
                  color: "#b8b8b8",
                  textAlign: "center",
                  letterSpacing: 1,
                  fontStyle: "italic",
                }}
              >
                Relationship insights revealed
              </Text>
            </View>

            <View 
              style={{ 
                width: 80, 
                height: 1, 
                backgroundColor: "#d4af37", 
                marginVertical: 20,
                opacity: 0.3
              }} 
            />

            <View className="items-center">
              <Text 
                style={{
                  fontSize: 24,
                  fontWeight: "400",
                  color: "#ffffff",
                  textAlign: "center",
                  marginBottom: 4,
                  letterSpacing: 2,
                  fontStyle: "italic",
                }}
              >
                Big Three Analysis
              </Text>
              <Text 
                style={{
                  fontSize: 13,
                  fontWeight: "300",
                  color: "#b8b8b8",
                  textAlign: "center",
                  letterSpacing: 1,
                  fontStyle: "italic",
                }}
              >
                Sun, Moon & Rising signs
              </Text>
            </View>
          </View>

          {/* Decorative Bottom Line */}
          <View 
            style={{ 
              width: 60, 
              height: 2, 
              backgroundColor: "#d4af37", 
              marginTop: 20,
              opacity: 0.8
            }} 
          />
        </View>
      </ScrollView>

      {/* Continue Button - Theatre Style */}
      <View 
        className="px-8 pb-10 pt-6" 
        style={{ 
          backgroundColor: "#1a1a2e",
          borderTopWidth: 1,
          borderTopColor: "#d4af37",
          borderTopOpacity: 0.3,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.replace("UserInfoChat")}
          style={{
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: "#d4af37",
            borderRadius: 0,
            paddingVertical: 16,
            paddingHorizontal: 40,
            alignItems: "center",
            shadowColor: "#d4af37",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
          activeOpacity={0.8}
        >
          <Text 
            style={{
              color: "#d4af37",
              fontSize: 18,
              fontWeight: "400",
              letterSpacing: 4,
              textTransform: "uppercase",
              fontStyle: "italic",
            }}
          >
            Begin the Performance
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
