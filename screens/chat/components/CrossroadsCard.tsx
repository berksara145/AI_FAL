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
import { Colors, ChatColors } from "../../../utils/theme";
import { useTranslation } from "react-i18next";
import i18n from "../../../lib/i18n";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(Math.floor(SCREEN_WIDTH * 0.32), 130);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.757);

const DIRECTION_CONFIG = {
  proceed: { color: "#1a6b40", key: "crossroads.proceed" },  // dark green
  pause:   { color: "#8a6010", key: "crossroads.pause" },   // dark gold-brown
  wait:    { color: "#5a2da0", key: "crossroads.wait" },    // dark purple
};

interface Props {
  card: CrossroadsCard;
  tarotCard: TarotCard | undefined;
  revealed: boolean;
  generating: boolean;
}

function BouncingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: -5, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.delay(500),
        ])
      );
    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 160);
    const a3 = bounce(dot3, 320);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={{ transform: [{ translateY: dot }] }}>
          <Text style={styles.dot}>•</Text>
        </Animated.View>
      ))}
    </View>
  );
}

export default function CrossroadsCard({ card, tarotCard, revealed, generating }: Props) {
  const { t } = useTranslation();
  const isTr = i18n.language === "tr";
  const cardName = isTr ? card.nameTr : card.name;
  const cardVerdict = isTr ? card.verdictTr : card.verdict;
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
            <Text style={styles.cardName}>{cardName}</Text>
            <Text style={styles.verdict}>{cardVerdict}</Text>
          </View>
        )}
      </View>

      {generating && (
        <View style={styles.generatingRow}>
          <Text style={styles.generatingText}>{t("crossroads.reading")}</Text>
          <BouncingDots />
        </View>
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
    color: ChatColors.lunaraLabel,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  verdict: {
    fontSize: 13,
    color: ChatColors.lunaraText,
    lineHeight: 20,
    fontStyle: "italic",
  },
  generatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  generatingText: {
    fontSize: 12,
    color: ChatColors.lunaraLabel,
    letterSpacing: 2,
    fontStyle: "italic",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingBottom: 2,
  },
  dot: {
    fontSize: 16,
    color: ChatColors.lunaraLabel,
    lineHeight: 16,
  },
});
