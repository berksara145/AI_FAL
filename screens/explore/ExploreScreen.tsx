import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import FeatureCard from "./components/FeatureCard";

// Feature configurations with predetermined messages
const FEATURES = {
  "general": {
    title: "What's weighing on you?",
    feature: "What's weighing on you?",
    initialMessage: "✨ What's weighing on you? Speak freely, and I'm here to listen and guide you through whatever is on your mind.",
  },
  "todays-energy": {
    title: "Today's energy",
    feature: "Today's Energy",
    initialMessage: "🌙 Let's explore the energy of today. What aspects of today's cosmic influences would you like to understand?",
  },
  "someone-on-mind": {
    title: "Someone on your mind?",
    feature: "Someone on your mind?",
    initialMessage: "❤️ Tell me about the person on your mind. I can help you understand the dynamics, compatibility, and what the stars reveal about your connection.",
  },
  "friend-dynamics": {
    title: "Friend dynamics",
    feature: "Friend Dynamics",
    initialMessage: "🤝 Friendships have their own unique energy. Share what's happening with your friendships, and let's explore the dynamics together.",
  },
  "tarot-reading": {
    title: "Tarot reading",
    feature: "Tarot Reading",
    initialMessage: "🔮 The cards are ready to reveal their wisdom. What question or situation would you like guidance on today?",
  },
};

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleFeaturePress = (featureKey: keyof typeof FEATURES) => {
    const feature = FEATURES[featureKey];
    navigation.navigate("ChatSession", {
      feature: feature.feature,
      mode: "interactive",
      initialMessage: feature.initialMessage,
    });
  };

  return (
    <View 
      className="flex-1" 
      style={{ backgroundColor: "#1a0d2e" }}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            ────────────────────────{"\n"}
            {"        "}Astra ✨{"\n"}
            ────────────────────────
          </Text>
        </View>

        {/* Main Feature Card */}
        <View style={styles.mainCardContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleFeaturePress("general")}
            style={styles.mainCard}
          >
            <View style={styles.mainCardArt}>
              <Text style={styles.mainCardEmoji}>✨</Text>
            </View>
            <Text style={styles.mainCardTitle}>
              ✨ What's weighing{"\n"}
              {"    "}on you?
            </Text>
            <Text style={styles.mainCardSubtitle}>Speak freely.</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <FeatureCard
                emoji="🌙"
                title="Today's energy"
                onPress={() => handleFeaturePress("todays-energy")}
                variant="small"
              />
            </View>
            <View style={styles.gridItem}>
              <FeatureCard
                emoji="❤️"
                title="Someone on your mind?"
                onPress={() => handleFeaturePress("someone-on-mind")}
                variant="small"
              />
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <FeatureCard
                emoji="🤝"
                title="Friend dynamics"
                onPress={() => handleFeaturePress("friend-dynamics")}
                variant="small"
              />
            </View>
            <View style={styles.gridItem}>
              <FeatureCard
                emoji="🔮"
                title="Tarot reading"
                onPress={() => handleFeaturePress("tarot-reading")}
                variant="small"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#d4af37",
    letterSpacing: 2,
    textAlign: "center",
    lineHeight: 28,
  },
  mainCardContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  mainCard: {
    backgroundColor: "#2d1b3d",
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.4)",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  mainCardArt: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.4)",
    borderStyle: "dashed",
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mainCardEmoji: {
    fontSize: 40,
  },
  mainCardTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#d4af37",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 8,
    lineHeight: 28,
  },
  mainCardSubtitle: {
    fontSize: 15,
    color: "rgba(212, 175, 55, 0.7)",
    textAlign: "center",
    fontStyle: "italic",
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: "row",
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
});
