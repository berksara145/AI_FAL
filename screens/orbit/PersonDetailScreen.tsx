import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackParamList } from "../../navigation/MainTabs";
import { getZodiacInfoFromBirthDate } from "./utils";
import { usePersonDetail } from "./hooks/usePersonDetail";
import { useTranslation } from "react-i18next";
import { EXPLORE_CLASSES } from "../explore/exploreClasses";
import i18n from "../../lib/i18n";
import InterpretationSection from "./components/InterpretationSection";
import { styles } from "./personDetailStyles";

type Props = NativeStackScreenProps<MainStackParamList, "PersonDetail">;

export default function PersonDetailScreen({ route }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { name, birthDate } = route.params;

  const zodiacInfo        = getZodiacInfoFromBirthDate(birthDate) ?? null;
  const zodiacImageSource = zodiacInfo?.image ?? null;

  const {
    loadingChart,
    pngUri,
    interpretation,
    generatingInterpretation,
    interpretationError,
    loadingPhrase,
    hasChart,
    birthTimeKnown,
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
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "MainTabs" as any, params: { initialTab: 1 } }],
            })
          );
        }}
        hitSlop={12}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color="#d4af37" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Zodiac symbol */}
        <View style={styles.symbolWrapper}>
          <View style={styles.symbolOuterRing}>
            <View style={styles.symbolInnerRing}>
              <Image source={zodiacImageSource} style={styles.symbolImage} resizeMode="contain" />
            </View>
          </View>
        </View>

        <Text style={styles.nameText}>{name}</Text>

        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Image source={zodiacImageSource} style={styles.pillIconImage} resizeMode="contain" />
            <Text style={styles.pillText}>{i18n.language === "tr" ? zodiacInfo?.nameTr : zodiacInfo?.name}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>✧</Text>
            <Text style={styles.pillText}>{t("personDetail.born")}: {birthDate}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Birth time unknown banner */}
        {hasChart && !birthTimeKnown && (
          <View style={styles.unknownTimeWrapper}>
            <View style={styles.unknownTimeBanner}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(212,175,55,0.6)" />
              <Text style={styles.unknownTimeBannerTitle}>{t("personDetail.birthTimeUnknownTitle")}</Text>
            </View>
            <Text style={styles.unknownTimeBannerDesc}>{t("personDetail.birthTimeUnknownDesc")}</Text>
            <View style={styles.lockedCardsRow}>
              {[
                { label: t("personDetail.birthTimeUnknownRising"), icon: "arrow-up-circle-outline" },
                { label: t("personDetail.birthTimeUnknownHouses"), icon: "home-outline" },
                { label: t("personDetail.birthTimeUnknownMC"),     icon: "star-outline" },
              ].map(({ label, icon }) => (
                <View key={label} style={styles.lockedCard}>
                  <MaterialCommunityIcons name={icon as any} size={20} color="rgba(212,175,55,0.3)" />
                  <MaterialCommunityIcons name="lock-outline" size={11} color="rgba(212,175,55,0.3)" style={styles.lockIcon} />
                  <Text style={styles.lockedCardLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Chart or CTA */}
        {!loadingChart && (
          pngUri ? (
            <View style={[styles.chartImage, { width: chartSize, height: chartSize }]}>
              <Image
                source={{ uri: pngUri }}
                style={{ width: chartSize, height: chartSize }}
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

        {/* Analysis section */}
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
