import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { MainStackParamList } from "../../navigation/MainTabs";
import type { RootStackParamList } from "../../navigation/RootStack";
import { getZodiacInfoFromBirthDate } from "./utils";

type Props = NativeStackScreenProps<MainStackParamList, "PersonDetail">;

export default function PersonDetailScreen({ route }: Props) {
  const navigation = useNavigation();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { name, birthDate } = route.params;
  console.log("birthDate", birthDate);  
  const zodiacInfo = getZodiacInfoFromBirthDate(birthDate) ?? null;
  const zodiacImageSource = zodiacInfo?.image ?? null;

  console.log("zodiacInfo", zodiacInfo);  
  return (
    <ImageBackground
      source={require("../../assets/personDetailBg.png")}
      resizeMode="cover"
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.content}>
        {/* Top symbol */}
        <View style={styles.symbolWrapper}>
          <View style={styles.symbolOuterRing}>
            <View style={styles.symbolInnerRing}>
              <Image
                source={zodiacImageSource}
                style={styles.symbolImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.nameText}>{name}</Text>

        {/* Pills: zodiac + birth date */}
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Image
              source={zodiacImageSource}
              style={styles.pillIconImage}
              resizeMode="contain"  
            />
            <Text style={styles.pillText}>{zodiacInfo?.name}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>✧</Text>
            <Text style={styles.pillText}>Born: {birthDate}</Text>
          </View>
        </View>

        <Text style={styles.statusText}>Birth map not generated yet</Text>

        <View style={styles.separator} />

        {/* Generate Birth Map button */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.ctaButton}
          onPress={() => {
            rootNavigation?.navigate("ChatSession", {
              feature: "birthMap",
              mode: "interactive",
              birthDate,
            });
          }}
        >
          <View style={styles.ctaGlow} />
          <Text style={styles.ctaText}>Generate Birth Map</Text>
        </TouchableOpacity>

        <Text style={styles.ctaSubText}>Requires birth date, time, and location</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050016",
  },
  backgroundImage: {
    opacity: 0.9,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  symbolWrapper: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "rgba(250, 218, 134, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  symbolInnerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "rgba(250, 218, 134, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  symbolImage: {
    width: 80,
    height: 80,
  },
  nameText: {
    fontSize: 30,
    color: "#f7e3a5",
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(250, 218, 134, 0.9)",
    backgroundColor: "transparent",
  },
  pillIcon: {
    fontSize: 16,
    color: "#FADA86",
    marginRight: 6,
  },
  pillIconImage: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  pillText: {
    fontSize: 14,
    color: "#f7e3a5",
  },
  statusText: {
    marginTop: 8,
    fontSize: 16,
    color: "#f5e8c5",
  },
  separator: {
    marginTop: 40,
    marginBottom: 32,
    width: "70%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(250, 218, 134, 0.5)",
  },
  ctaButton: {
    width: "80%",
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(250, 218, 134, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  ctaGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(205, 141, 255, 0.25)",
  },
  ctaText: {
    fontSize: 18,
    color: "#fdf4c8",
    letterSpacing: 1.5,
  },
  ctaSubText: {
    fontSize: 12,
    color: "rgba(245, 234, 200, 0.9)",
  }
});

