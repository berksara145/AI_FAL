import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
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
  "dream-insights": {
    title: "Dream insights",
    feature: "Dream Insights",
    initialMessage: "💭 Dreams carry messages from your subconscious. Share your dream with me, and let's explore what it might be revealing about your inner world.",
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
          <View style={styles.headerImageContainer}>
            <Image 
              source={require("../../assets/lunara.png")} 
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Feature Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <FeatureCard
              image={require("../../assets/feature4.png")}
              noBackground={true}
              title="Talk with me"
              onPress={() => handleFeaturePress("general")}
            />
          </View>
          <View style={styles.gridItem}>
            <FeatureCard
              image={require("../../assets/feature5.png")}
              noBackground={true}
              title="Today's energy"
              onPress={() => handleFeaturePress("todays-energy")}
            />
          </View>
          <View style={styles.gridItem}>
            <FeatureCard
              image={require("../../assets/feature4.png")}
              title="Love Insights"
              noBackground={true}
              onPress={() => handleFeaturePress("someone-on-mind")}
            />
          </View>
          <View style={styles.gridItem}>
            <FeatureCard
              image={require("../../assets/feature4.png")}
              title="Friend dynamics"
              noBackground={true}
              onPress={() => handleFeaturePress("friend-dynamics")}
            />
          </View>
          <View style={styles.gridItem}>
            <FeatureCard
              image={require("../../assets/feature5.png")}
              title="Tarot reading"
              noBackground={true}
              onPress={() => handleFeaturePress("tarot-reading")}
            />
          </View>
          <View style={styles.gridItem}>
            <FeatureCard
              image={require("../../assets/feature4.png")}  
              title="Dream insights"
              noBackground={true}
              onPress={() => handleFeaturePress("dream-insights")}
            />
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
    marginBottom: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerImageContainer: {
    width: "100%",
    height: 120,
    maxWidth: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    width: "80%",
    height: "100%",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    rowGap: 30,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "30%",
  },
});
