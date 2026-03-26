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
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackParamList } from "../../navigation/MainTabs";
import { getZodiacInfoFromBirthDate } from "./utils";
import { Colors } from "../../utils/theme";
import { usePersonDetail } from "./hooks/usePersonDetail";
import { useTranslation } from "react-i18next";
import { EXPLORE_CLASSES } from "../explore/exploreClasses";
import i18n from "../../lib/i18n";

type Props = NativeStackScreenProps<MainStackParamList, "PersonDetail">;

const SECTION_META: Record<string, { subtitle: string; accent: string }> = {
  "Core Identity": { subtitle: "Sun · Moon · Rising",    accent: "rgba(212,175,55,0.8)"  },
  "Inner World":   { subtitle: "Emotions · Aspects",     accent: "rgba(180,140,255,0.8)" },
  "Life Path":     { subtitle: "Purpose · Growth",       accent: "rgba(100,210,190,0.8)" },
};

function parseSections(text: string): { header: string; body: string }[] {
  const parts = text.split(/\*\*✦\s+/);
  return parts
    .filter((p) => p.trim())
    .map((part) => {
      const nl = part.indexOf("\n");
      const header = (nl > -1 ? part.slice(0, nl) : part).replace(/\*\*/g, "").trim();
      const body   = (nl > -1 ? part.slice(nl)   : "").replace(/\*\*/g, "").trim();
      return { header, body };
    })
    .filter((s) => s.header && s.body);
}

function InterpretationSection({ text }: { text: string }) {
  const sections = parseSections(text);

  // Fallback: if parsing fails (unexpected format), render plain text
  if (sections.length === 0) {
    return (
      <Text style={styles.sectionBody}>
        {text.replace(/\*\*/g, "").trim()}
      </Text>
    );
  }

  return (
    <>
      {sections.map(({ header, body }) => {
        const meta = SECTION_META[header] ?? { subtitle: "", accent: "rgba(212,175,55,0.8)" };
        return (
          <View key={header} style={[styles.sectionCard, { borderLeftColor: meta.accent }]}>
            <Text style={[styles.sectionCardTitle, { color: meta.accent }]}>
              ✦ {header.toUpperCase()}
            </Text>
            {meta.subtitle ? (
              <Text style={styles.sectionCardSubtitle}>{meta.subtitle}</Text>
            ) : null}
            <View style={styles.bulletList}>
              {body.split("\n").filter((l) => l.trim()).map((line, i) => {
                const clean = line.replace(/^[-•]\s*/, "").trim();
                return (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bulletDot, { color: meta.accent }]}>·</Text>
                    <Text style={styles.sectionCardBody}>{clean}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </>
  );
}

export default function PersonDetailScreen({ route }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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

  const rootNavigation = navigation.getParent();

  const openBirthMap = () => {
    (rootNavigation ?? navigation as any).navigate("ChatSession", {
      feature: "birthMap",
      mode: "interactive",
      birthDate,
      personName: name,
    } as any);
  };

  const openChartChat = () => {
    const natalClass = EXPLORE_CLASSES.find((c) => c.id === "natal-chart-analysis");
    if (!natalClass) return;
    const isTr = i18n.language === "tr";
    (rootNavigation ?? navigation as any).navigate("ChatSession", {
      feature: natalClass.feature,
      mode: "interactive",
      initialMessage: t("explore.initialBirthChart"),
      agenda: isTr ? natalClass.agendaTr : natalClass.agenda,
    } as any);
  };

  return (
    <ImageBackground
      source={require("../../assets/personDetailBg.png")}
      resizeMode="cover"
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={() => {
          // Reset MainStack to just MainTabs/Orbit — cuts through any stale ChatSession history
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "MainTabs" as any, params: { screen: "Orbit" } }],
            })
          );
        }}
        hitSlop={12}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.goldPrimary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
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
              <Text style={styles.ctaText}>{t("personDetail.openBirthMap")}</Text>
            </TouchableOpacity>
          )
        )}

        {!hasChart && !loadingChart && (
          <Text style={styles.ctaSubText}>{t("personDetail.openBirthMapSubtitle")}</Text>
        )}

        {/* Analysis section — only shown when chart exists */}
        {hasChart && (
          <View style={styles.analysisWrapper}>
            <View style={styles.analysisTitleRow}>
              <Text style={styles.analysisTitle}>{t("personDetail.natalChartReading")}</Text>
            </View>

            {generatingInterpretation && (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingStars}>✦  ✦  ✦</Text>
                <Text style={styles.loadingPhrase}>{loadingPhrase}</Text>
                <Text style={styles.loadingNote}>{t("personDetail.preparingReading")}</Text>
              </View>
            )}

            {!generatingInterpretation && interpretationError && (
              <TouchableOpacity style={styles.errorCard} onPress={retryGeneration} activeOpacity={0.8}>
                <Text style={styles.errorText}>{interpretationError}</Text>
                <Text style={styles.retryText}>{t("personDetail.tapToRetry")}</Text>
              </TouchableOpacity>
            )}

            {!generatingInterpretation && interpretation && (
              <View style={styles.sectionsWrapper}>
                <InterpretationSection text={interpretation} />
              </View>
            )}

            {/* Chat CTA */}
            {interpretation && !generatingInterpretation && (
              <TouchableOpacity style={styles.chatButton} onPress={openChartChat} activeOpacity={0.85}>
                <Text style={styles.chatButtonText}>{t("personDetail.chatAboutChart")}</Text>
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
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(26,13,46,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  scrollContent: {
    alignItems: "center",
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
  sectionsWrapper: {
    gap: 12,
  },
  sectionCard: {
    borderLeftWidth: 3,
    borderRadius: 12,
    backgroundColor: "rgba(26, 13, 46, 0.75)",
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 16,
  },
  sectionCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  sectionCardSubtitle: {
    fontSize: 11,
    color: "rgba(245, 234, 200, 0.4)",
    letterSpacing: 1,
    marginBottom: 10,
  },
  bulletList: {
    gap: 8,
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    fontSize: 20,
    lineHeight: 26,
  },
  sectionCardBody: {
    flex: 1,
    fontSize: 15,
    color: "rgba(245, 234, 200, 0.9)",
    lineHeight: 26,
    fontWeight: "300",
  },
  sectionBody: {
    fontSize: 15,
    color: "rgba(245, 234, 200, 0.9)",
    lineHeight: 26,
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
