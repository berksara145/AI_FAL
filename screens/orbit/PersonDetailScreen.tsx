import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, InteractionManager, Dimensions, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { MainStackParamList } from "../../navigation/MainTabs";
import type { RootStackParamList } from "../../navigation/RootStack";
import { getZodiacInfoFromBirthDate } from "./utils";
import { getPersonByName } from "../../db/person.repo";

type Props = NativeStackScreenProps<MainStackParamList, "PersonDetail">;

export default function PersonDetailScreen({ route }: Props) {
  const navigation = useNavigation();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { name, birthDate } = route.params;
  console.log("birthDate", birthDate);  
  console.log("name: ", name);
  const zodiacInfo = getZodiacInfoFromBirthDate(birthDate) ?? null;
  const zodiacImageSource = zodiacInfo?.image ?? null;
  const [loadingChart, setLoadingChart] = useState(true);
  const [pngUri, setPngUri] = useState<string | null>(null);

  // Reload chart whenever this screen gains focus (so going back will refresh)
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      setLoadingChart(true);

      InteractionManager.runAfterInteractions(() => {
        (async () => {
          try {
            const personName = name;

            if (!personName) {
              if (mounted) {
                setPngUri(null);
                setLoadingChart(false);
              }
              return;
            }

            const person = await getPersonByName(personName);

            if (!mounted) return;

            if (person) {
              // Fast path: if a cached PNG path exists, show it immediately (instant)
              if (person.png_path) {
                if (mounted) {
                  setPngUri(person.png_path);
                  setLoadingChart(false);
                }
              } else {
                if (mounted) {
                  setPngUri(null);
                  setLoadingChart(false);
                }
              }
            } else {
              if (mounted) {
                setPngUri(null);
                setLoadingChart(false);
              }
            }
            } catch (err) {
              console.warn("Error loading natal chart:", err);
              if (mounted) {
                setPngUri(null);
                setLoadingChart(false);
              }
            }
        })();
      });

      return () => {
        mounted = false;
      };
    }, [name])
  );

  // No SVG rendering/capture on this screen — we only show cached PNGs.

  const { width: screenWidth } = Dimensions.get("window");
  const chartSize = Math.min(screenWidth - 48, 400);

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

        <View style={styles.separator} />

        {/* If chart exists display it, otherwise show a button to open/generate it.
            Only show the button after we've finished loading the check. */}
        {!loadingChart ? (
          pngUri ? (
            <View style={[styles.chartImage, { width: chartSize, height: chartSize }]}>
              <Image
                source={{ uri: pngUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaButton}
              onPress={() => {
                console.log("[PersonDetailScreen] Open Birth Map pressed", { birthDate, loadingChart });
                if (rootNavigation) {
                  rootNavigation.navigate("ChatSession", {
                    feature: "birthMap",
                    mode: "interactive",
                    birthDate,
                    personName: name,
                  } as any);
                } else {
                  (navigation as any).navigate("ChatSession", {
                    feature: "birthMap",
                    mode: "interactive",
                    birthDate,
                    personName: name,
                  } as any);
                }
              }}
            >
              <View style={styles.ctaGlow} />
              <Text style={styles.ctaText}>Open Birth Map</Text>
            </TouchableOpacity>
          )
        ) : null}

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
  separator: {
    marginTop: 24,
    marginBottom: 20,
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
  },
  chartImage: {
    marginTop: 8,
    borderRadius: 999,
    overflow: "hidden",
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "rgba(250, 218, 134, 0.9)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
});

