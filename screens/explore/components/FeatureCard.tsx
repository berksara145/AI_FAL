import React from "react";
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from "react-native";

type FeatureCardProps = {
  title: string;
  subtitle?: string;
  emoji?: string;
  image?: ImageSourcePropType;
  onPress?: () => void;
  variant?: "large" | "small";
};

export default function FeatureCard({
  title,
  subtitle,
  emoji,
  image,
  onPress,
  variant = "small",
}: FeatureCardProps) {
  const isLarge = variant === "large";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#1a0d2e",
        borderWidth: 2,
        borderColor: "rgba(212, 175, 55, 0.3)",
        borderRadius: 16,
        padding: isLarge ? 24 : 20,
        height: isLarge ? 140 : 160,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Art placeholder - outline */}
      <View
        style={{
          width: isLarge ? 80 : 60,
          height: isLarge ? 80 : 60,
          marginBottom: 12,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {image ? (
          <Image 
            source={image} 
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        ) : (
          <Text style={{ fontSize: isLarge ? 32 : 24 }}>{emoji}</Text>
        )}
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: isLarge ? 18 : 16,
          fontWeight: "500",
          color: "#d4af37",
          textAlign: "center",
          letterSpacing: 0.5,
          marginBottom: subtitle ? 4 : 0,
        }}
      >
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text
          style={{
            fontSize: 13,
            color: "rgba(212, 175, 55, 0.7)",
            textAlign: "center",
            fontStyle: "italic",
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}
