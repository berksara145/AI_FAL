import React from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import FeatureCard from "./components/FeatureCard";
import { EXPLORE_CLASSES, type ExploreClassId } from "./exploreClasses";

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleClassPress = (classId: ExploreClassId) => {
    const exploreClass = EXPLORE_CLASSES.find((c) => c.id === classId);
    if (!exploreClass) return;
    navigation.navigate("ChatSession", {
      feature: exploreClass.feature,
      mode: "interactive",
      initialMessage: exploreClass.initialMessage,
      agenda: exploreClass.agenda,
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

        {/* 6 feature cards — each uses ChatSession with its own agenda */}
        <View style={styles.gridContainer}>
          {EXPLORE_CLASSES.map((exploreClass) => (
            <View key={exploreClass.id} style={styles.gridItem}>
              <FeatureCard
                image={
                  exploreClass.imageKey === "feature5"
                    ? require("../../assets/feature5.png")
                    : require("../../assets/feature4.png")
                }
                noBackground={true}
                title={exploreClass.title}
                onPress={() => handleClassPress(exploreClass.id)}
              />
            </View>
          ))}
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
