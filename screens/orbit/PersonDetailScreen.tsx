import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, InteractionManager } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { SvgXml } from "react-native-svg";
import type { MainStackParamList } from "../../navigation/MainTabs";
import type { RootStackParamList } from "../../navigation/RootStack";
import { getZodiacInfoFromBirthDate } from "./utils";
import { getOrCreateUser } from "../../db/user.repo";
import { querySql } from "../../db/database";

type Props = NativeStackScreenProps<MainStackParamList, "PersonDetail">;

export default function PersonDetailScreen({ route }: Props) {
  const navigation = useNavigation();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { name, birthDate } = route.params;
  console.log("birthDate", birthDate);  
  const zodiacInfo = getZodiacInfoFromBirthDate(birthDate) ?? null;
  const zodiacImageSource = zodiacInfo?.image ?? null;
  const [loadingChart, setLoadingChart] = useState(true);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgImageError, setSvgImageError] = useState(false);

  // Reload chart whenever this screen gains focus (so going back will refresh)
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      setLoadingChart(true);

      InteractionManager.runAfterInteractions(() => {
        (async () => {
          try {
            const user = await getOrCreateUser();
            const personName = user.name;

            if (!personName) {
              if (mounted) {
                setSvgContent(null);
                setLoadingChart(false);
              }
              return;
            }

            const rows = await querySql<any>(
              "SELECT * FROM natal_charts WHERE person_name = ? ORDER BY created_at DESC LIMIT 1",
              [personName]
            );

            if (!mounted) return;

            if (rows && rows.length > 0 && rows[0].svg_content) {
              // Slight delay to avoid blocking UI thread immediately
              setTimeout(() => {
                if (!mounted) return;
                setSvgContent(rows[0].svg_content);
                setLoadingChart(false);
              }, 150);
            } else {
              if (mounted) {
                setSvgContent(null);
                setLoadingChart(false);
              }
            }
          } catch (err) {
            console.warn("Error loading natal chart:", err);
            if (mounted) {
              setSvgContent(null);
              setLoadingChart(false);
            }
          }
        })();
      });

      return () => {
        mounted = false;
      };
    }, [])
  );

  // reset image error when svg content changes
  useEffect(() => {
    setSvgImageError(false);
  }, [svgContent]);

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

        <Text style={styles.statusText}>
          {loadingChart
            ? "Checking for saved birth map..."
            : svgContent
            ? "Birth map available"
            : "Birth map not generated yet"}
        </Text>

        <View style={styles.separator} />

        {/* If chart exists display it, otherwise show a button to open/generate it.
            Only show the button after we've finished loading the check. */}
        {!loadingChart ? (
          svgContent && !svgImageError ? (
            <View style={styles.chartImage}>
              <SvgXml
                xml={svgContent}
                width="100%"
                height="100%"
                onError={(err) => {
                  console.warn("SVG failed to render:", err);
                  setSvgImageError(true);
                }}
              />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaButton}
              onPress={() => {
                console.log("[PersonDetailScreen] Open Birth Map pressed", { birthDate, svgContentPresent: !!svgContent, loadingChart });
                if (rootNavigation) {
                  rootNavigation.navigate("ChatSession", {
                    feature: "birthMap",
                    mode: "interactive",
                    birthDate,
                  });
                } else {
                  (navigation as any).navigate("ChatSession", {
                    feature: "birthMap",
                    mode: "interactive",
                    birthDate,
                  });
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
  ,
  chartImage: {
    width: 300,
    height: 300,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  }
});

