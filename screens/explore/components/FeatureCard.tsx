import React from "react";
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, StyleSheet, Platform } from "react-native";

type FeatureCardProps = {
  title: string;
  emoji?: string;
  image?: ImageSourcePropType;
  onPress?: () => void;
  noBackground?: boolean;
};

export default function FeatureCard({
  title,
  emoji,
  image,
  onPress,
  noBackground = false,
}: FeatureCardProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.square,
          noBackground && { backgroundColor: "transparent" },
        ]}
      >
        {image ? (
          <Image 
            source={image} 
            style={styles.image}
            resizeMode="contain"
          />
        ) : emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : null}
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  square: {
    width: "100%",
    aspectRatio: 0.667,
    backgroundColor: "#2d1b3d",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "visible",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emoji: {
    fontSize: 75,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  titleContainer: {
    width: "100%",
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F7C354",
    textAlign: "center",
    paddingHorizontal: 4,
    lineHeight: 20,
    letterSpacing: 1.5,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
});
