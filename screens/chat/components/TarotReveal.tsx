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
import { Colors } from "../../../utils/theme";

const POSITIONS = ["PAST", "TODAY", "FUTURE"] as const;
const POSITION_COLORS = [
  "rgba(180,140,255,0.9)",
  "rgba(212,175,55,0.9)",
  "rgba(100,210,190,0.9)",
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
                <Text style={styles.tapHintText}>tap</Text>
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

export default function TarotReveal({ cards, revealed, onReveal, generatingInterpretation }: TarotRevealProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {cards.map((card, i) => (
          <FlipCard
            key={card.id}
            card={card}
            revealed={revealed[i]}
            onReveal={() => onReveal(i as 0 | 1 | 2)}
            positionLabel={POSITIONS[i]}
            accentColor={POSITION_COLORS[i]}
            entryDelay={i * 150}
          />
        ))}
      </View>

      {generatingInterpretation && (
        <View style={styles.readingRow}>
          <Text style={styles.readingText}>✦  Reading the cards…  ✦</Text>
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
    fontSize: 10,
    color: "rgba(245,234,200,0.7)",
    textAlign: "center",
    letterSpacing: 0.5,
    maxWidth: CARD_WIDTH,
  },
  readingRow: {
    marginTop: 20,
  },
  readingText: {
    fontSize: 13,
    color: Colors.goldPrimary,
    letterSpacing: 2,
    fontStyle: "italic",
  },
});
