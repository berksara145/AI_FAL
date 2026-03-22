import React, { useRef, useEffect } from "react";
import {
  View,
  Image,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CARD_BACK } from "../../../lib/tarotDeck";
import type { TarotCard } from "../../../lib/tarotDeck";
import type { CrossroadsCard } from "../../../lib/cosmicCrossroads";
import { Colors } from "../../../utils/theme";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(Math.floor(SCREEN_WIDTH * 0.32), 130);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.757);

const DIRECTION_CONFIG = {
  proceed: { color: "rgba(100,210,150,0.9)", key: "crossroads.proceed" },
  pause:   { color: "rgba(212,175,55,0.9)",  key: "crossroads.pause" },
  wait:    { color: "rgba(180,140,255,0.9)", key: "crossroads.wait" },
};

interface Props {
  card: CrossroadsCard;
  tarotCard: TarotCard | undefined;
  revealed: boolean;
  generating: boolean;
}

export default function CrossroadsCard({ card, tarotCard, revealed, generating }: Props) {
  const { t } = useTranslation();
  const flipAnim = useRef(new Animated.Value(revealed ? 180 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (revealed) {
      Animated.timing(flipAnim, {
        toValue: 180,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [revealed]);

  const backRotate  = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg",   "180deg"] });
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

  const dirConfig = DIRECTION_CONFIG[card.direction];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Card flip */}
        <Animated.View style={[styles.scaleWrap, !revealed && { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.cardContainer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            {/* Back */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ perspective: 1200 }, { rotateY: backRotate }], backfaceVisibility: "hidden" },
              ]}
            >
              <Image source={CARD_BACK} style={styles.cardImage} resizeMode="cover" />
              {!revealed && (
                <View style={styles.hintOverlay}>
                  <Text style={styles.hintText}>{t("crossroads.askYourQuestion")}</Text>
                </View>
              )}
            </Animated.View>

            {/* Front */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ perspective: 1200 }, { rotateY: frontRotate }], backfaceVisibility: "hidden" },
              ]}
            >
              {tarotCard ? (
                <Image source={tarotCard.image} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, styles.fallbackCard]} />
              )}
            </Animated.View>
          </View>
        </Animated.View>

        {/* Info column (visible after reveal) */}
        {revealed && (
          <View style={styles.infoCol}>
            <View style={[styles.directionBadge, { borderColor: dirConfig.color }]}>
              <Text style={[styles.directionText, { color: dirConfig.color }]}>
                {t(dirConfig.key).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.verdict}>{card.verdict}</Text>
          </View>
        )}
      </View>

      {generating && (
        <Text style={styles.generatingText}>{t("crossroads.reading")}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: "center",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scaleWrap: {
    // scale animation applied here
  },
  cardContainer: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.4)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  fallbackCard: {
    backgroundColor: "rgba(26,13,46,0.9)",
  },
  hintOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  hintText: {
    fontSize: 9,
    color: "rgba(212,175,55,0.55)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  infoCol: {
    flex: 1,
    gap: 10,
  },
  directionBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  directionText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  cardName: {
    fontSize: 15,
    color: Colors.goldPale,
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  verdict: {
    fontSize: 13,
    color: "rgba(245,234,200,0.75)",
    lineHeight: 20,
    fontStyle: "italic",
  },
  generatingText: {
    fontSize: 12,
    color: Colors.goldPrimary,
    letterSpacing: 2,
    fontStyle: "italic",
  },
});
