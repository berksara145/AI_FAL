import React, { useRef, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from "react-native";
import type { TarotCard } from "../../../lib/tarotDeck";
import { CARD_BACK } from "../../../lib/tarotDeck";
import { Colors, ChatColors } from "../../../utils/theme";
import { useTranslation } from "react-i18next";
const POSITION_COLORS = [
  "#6a3db0",   // dark purple — visible on parchment
  "#8a6010",   // dark gold-brown
  "#1a7060",   // dark teal
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - 80) / 3);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.757);

function FlipCard({
  card,
  revealed,
  onReveal,
  positionLabel,
  accentColor,
  entryDelay,
}: {
  card: TarotCard;
  revealed: boolean;
  onReveal: () => void;
  positionLabel: string;
  accentColor: string;
  entryDelay: number;
}) {
  const { t } = useTranslation();
  const flipAnim = useRef(new Animated.Value(revealed ? 180 : 0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 500,
      delay: entryDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (revealed) {
      Animated.timing(flipAnim, {
        toValue: 180,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [revealed]);

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });
  const entryTranslate = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Animated.View
      style={[styles.cardWrapper, { opacity: entryAnim, transform: [{ translateY: entryTranslate }] }]}
    >
      <TouchableOpacity activeOpacity={revealed ? 1 : 0.75} onPress={revealed ? undefined : onReveal} disabled={revealed}>
        <View style={[styles.cardContainer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
          {/* Back face */}
          <Animated.View
            style={[StyleSheet.absoluteFill, { transform: [{ perspective: 1200 }, { rotateY: backRotate }], backfaceVisibility: "hidden" }]}
          >
            <Image source={CARD_BACK} style={styles.cardImage} resizeMode="cover" />
            {!revealed && (
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>{t("tarot.tap")}</Text>
              </View>
            )}
          </Animated.View>
          {/* Front face */}
          <Animated.View
            style={[StyleSheet.absoluteFill, { transform: [{ perspective: 1200 }, { rotateY: frontRotate }], backfaceVisibility: "hidden" }]}
          >
            <Image source={card.image} style={styles.cardImage} resizeMode="cover" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <Text style={[styles.positionLabel, { color: accentColor }]}>{positionLabel}</Text>
      {revealed && (
        <Text style={styles.cardName} numberOfLines={2}>{card.name}</Text>
      )}
    </Animated.View>
  );
}

interface TarotRevealProps {
  cards: [TarotCard, TarotCard, TarotCard];
  revealed: [boolean, boolean, boolean];
  onReveal: (index: 0 | 1 | 2) => void;
  generatingInterpretation: boolean;
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

export default function TarotReveal({ cards, revealed, onReveal, generatingInterpretation }: TarotRevealProps) {
  const { t } = useTranslation();
  const positions = [t("tarot.past"), t("tarot.today"), t("tarot.future")];
  const allRevealed = revealed.every(Boolean);
  const revealedCount = revealed.filter(Boolean).length;

  return (
    <View style={styles.container}>
      {!allRevealed && !generatingInterpretation && (
        <Text style={styles.revealHint}>
          {t("tarot.revealHint")} ({revealedCount}/3)
        </Text>
      )}
      <View style={styles.row}>
        {cards.map((card, i) => (
          <FlipCard
            key={card.id}
            card={card}
            revealed={revealed[i]}
            onReveal={() => onReveal(i as 0 | 1 | 2)}
            positionLabel={positions[i]}
            accentColor={POSITION_COLORS[i]}
            entryDelay={i * 150}
          />
        ))}
      </View>

      {generatingInterpretation && (
        <View style={styles.readingRow}>
          <Text style={styles.readingText}>{t("tarot.readingCards")}</Text>
          <BouncingDots />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  cardWrapper: {
    alignItems: "center",
    gap: 8,
  },
  cardContainer: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  tapHint: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8,
  },
  tapHintText: {
    fontSize: 10,
    color: "rgba(212,175,55,0.6)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  positionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  cardName: {
    fontSize: 13,
    color: ChatColors.lunaraText,
    textAlign: "center",
    letterSpacing: 0.5,
    fontWeight: "500",
    maxWidth: CARD_WIDTH,
  },
  revealHint: {
    fontSize: 11,
    color: "rgba(160,120,10,1)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 10,
  },
  readingRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readingText: {
    fontSize: 13,
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
