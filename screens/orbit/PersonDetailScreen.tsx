import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { MainStackParamList } from "../../navigation/MainTabs";
import type { RootStackParamList } from "../../navigation/RootStack";
import { getZodiacInfoFromBirthDate } from "./utils";
import { Colors } from "../../utils/theme";
import { usePersonDetail } from "./hooks/usePersonDetail";

type Props = NativeStackScreenProps<MainStackParamList, "PersonDetail">;

function InterpretationSection({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim());
  return (
    <>
      {lines.map((line, i) => {
        const isHeader = line.includes("✦");
        const clean = line.replace(/\*\*/g, "").trim();
        if (!clean) return null;
        return (
          <Text key={i} style={isHeader ? styles.sectionHeader : styles.sectionBody}>
            {clean}
          </Text>
        );
      })}
    </>
  );
}

export default function PersonDetailScreen({ route }: Props) {
  const navigation = useNavigation();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { name, birthDate } = route.params;

  const zodiacInfo = getZodiacInfoFromBirthDate(birthDate) ?? null;
  const zodiacImageSource = zodiacInfo?.image ?? null;

  const {
    loadingChart,
    pngUri,
    interpretation,
    generatingInterpretation,
    interpretationError,
    loadingPhrase,
    hasChart,
    retryGeneration,
  } = usePersonDetail(name);

  const { width: screenWidth } = Dimensions.get("window");
  const chartSize = Math.min(screenWidth - 48, 400);

  const openBirthMap = () => {
    const nav = rootNavigation ?? (navigation as any);
    nav.navigate("ChatSession", {
      feature: "birthMap",
      mode: "interactive",
      birthDate,
      personName: name,
    } as any);
  };

  const openChartChat = () => {
    const nav = rootNavigation ?? (navigation as any);
    nav.navigate("ChatSession", {
      feature: "natalChartAnalysis",
      mode: "interactive",
    } as any);
  };

  return (
    <ImageBackground
      source={require("../../assets/personDetailBg.png")}
      resizeMode="cover"
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Zodiac symbol */}
        <View style={styles.symbolWrapper}>
          <View style={styles.symbolOuterRing}>
            <View style={styles.symbolInnerRing}>
              <Image source={zodiacImageSource} style={styles.symbolImage} resizeMode="contain" />
            </View>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.nameText}>{name}</Text>

        {/* Pills */}
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Image source={zodiacImageSource} style={styles.pillIconImage} resizeMode="contain" />
            <Text style={styles.pillText}>{zodiacInfo?.name}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>✧</Text>
            <Text style={styles.pillText}>Born: {birthDate}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Chart or CTA */}
        {!loadingChart && (
          pngUri ? (
            <View style={[styles.chartImage, { width: chartSize, height: chartSize }]}>
              <Image
                source={{ uri: pngUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </View>
          ) : (
            <TouchableOpacity activeOpacity={0.9} style={styles.ctaButton} onPress={openBirthMap}>
              <View style={styles.ctaGlow} />
              <Text style={styles.ctaText}>Open Birth Map</Text>
            </TouchableOpacity>
          )
        )}

        {!hasChart && !loadingChart && (
          <Text style={styles.ctaSubText}>Requires birth date, time, and location</Text>
        )}

        {/* Analysis section — only shown when chart exists */}
        {hasChart && (
          <View style={styles.analysisWrapper}>
            <View style={styles.analysisTitleRow}>
              <Text style={styles.analysisTitle}>✦ Natal Chart Reading</Text>
            </View>

            {generatingInterpretation && (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingStars}>✦  ✦  ✦</Text>
                <Text style={styles.loadingPhrase}>{loadingPhrase}</Text>
                <Text style={styles.loadingNote}>Lunara is preparing your reading…</Text>
              </View>
            )}

            {!generatingInterpretation && interpretationError && (
              <TouchableOpacity style={styles.errorCard} onPress={retryGeneration} activeOpacity={0.8}>
                <Text style={styles.errorText}>{interpretationError}</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            )}

            {!generatingInterpretation && interpretation && (
              <View style={styles.interpretationCard}>
                <InterpretationSection text={interpretation} />
              </View>
            )}

            {/* Chat CTA */}
            {interpretation && !generatingInterpretation && (
              <TouchableOpacity style={styles.chatButton} onPress={openChartChat} activeOpacity={0.85}>
                <Text style={styles.chatButtonText}>✦ Chat about this chart</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  backgroundImage: {
    opacity: 0.9,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 60,
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
    borderColor: Colors.borderGoldMid,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolInnerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: Colors.borderGoldStrong,
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
    color: Colors.goldPale,
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
    borderColor: Colors.borderGoldStrong,
    backgroundColor: "transparent",
  },
  pillIcon: {
    fontSize: 16,
    color: Colors.goldLight,
    marginRight: 6,
  },
  pillIconImage: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  pillText: {
    fontSize: 14,
    color: Colors.goldPale,
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
    borderColor: Colors.borderGoldStrong,
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
    color: Colors.goldCream,
    letterSpacing: 1.5,
  },
  ctaSubText: {
    fontSize: 12,
    color: "rgba(245, 234, 200, 0.9)",
    marginTop: 4,
  },
  chartImage: {
    marginTop: 8,
    borderRadius: 999,
    overflow: "hidden",
    alignSelf: "center",
    borderWidth: 3,
    borderColor: Colors.borderGoldStrong,
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

  // ── Analysis ─────────────────────────────────────────────────
  analysisWrapper: {
    width: "100%",
    marginTop: 36,
  },
  analysisTitleRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 14,
    letterSpacing: 3,
    color: Colors.goldPrimary,
    textTransform: "uppercase",
    fontWeight: "400",
  },
  loadingCard: {
    borderWidth: 1,
    borderColor: "rgba(250, 218, 134, 0.2)",
    borderRadius: 16,
    backgroundColor: "rgba(26, 13, 46, 0.7)",
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },
  loadingStars: {
    fontSize: 18,
    color: "rgba(250, 218, 134, 0.4)",
    letterSpacing: 8,
  },
  loadingPhrase: {
    fontSize: 15,
    color: Colors.goldPale,
    letterSpacing: 0.5,
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingNote: {
    fontSize: 12,
    color: "rgba(245, 234, 200, 0.45)",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: "rgba(255, 100, 100, 0.3)",
    borderRadius: 16,
    backgroundColor: "rgba(26, 13, 46, 0.7)",
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: "rgba(255, 180, 180, 0.9)",
    textAlign: "center",
  },
  retryText: {
    fontSize: 13,
    color: Colors.goldPrimary,
    letterSpacing: 0.5,
  },
  interpretationCard: {
    borderWidth: 1,
    borderColor: "rgba(250, 218, 134, 0.2)",
    borderRadius: 16,
    backgroundColor: "rgba(26, 13, 46, 0.7)",
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 6,
  },
  sectionHeader: {
    fontSize: 13,
    color: Colors.goldPrimary,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    color: "rgba(245, 234, 200, 0.85)",
    lineHeight: 22,
    fontWeight: "300",
  },
  chatButton: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(250, 218, 134, 0.35)",
    backgroundColor: "rgba(26, 13, 46, 0.5)",
  },
  chatButtonText: {
    fontSize: 13,
    color: Colors.goldPale,
    letterSpacing: 1.5,
  },
});
