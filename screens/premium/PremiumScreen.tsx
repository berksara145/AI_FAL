import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
} from "react-native-svg";
import BackgroundScene from "./BackgroundScene";
import styles, { DEEP, W } from "./styles";

// ── Static plan config (prices stay as-is, labels come from i18n) ────────────
const PLANS = [
  { id: "weekly",  price: "₺284.99", popular: true,  hasSavings: false },
  { id: "monthly", price: "₺799.99", popular: false, hasSavings: true  },
] as const;

// ── Component ────────────────────────────────────────────────────────────────
export default function PremiumScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("weekly");

  const glowAnim    = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-W * 0.5)).current;
  const descAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    const runShimmer = () => {
      shimmerAnim.setValue(-W * 0.3);
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: W * 1.1, duration: 900, useNativeDriver: true }),
        Animated.delay(2400),
      ]).start(runShimmer);
    };
    const shimmerTimer = setTimeout(runShimmer, 600);

    Animated.timing(descAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }).start();

    return () => clearTimeout(shimmerTimer);
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] });

  return (
    <View style={styles.container}>
      <BackgroundScene />

      <View style={styles.page}>
        {/* Close */}
        <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 12 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.crownContainer}>
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { alignItems: "center", justifyContent: "center",
                  opacity: glowOpacity, transform: [{ scale: glowScale }] },
              ]}
            >
              <Svg width={90} height={90}>
                <Defs>
                  <RadialGradient id="crownGlow" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
                    <Stop offset="0%"   stopColor="#E8C97A" stopOpacity="1" />
                    <Stop offset="38%"  stopColor="#C9A84C" stopOpacity="0.5" />
                    <Stop offset="72%"  stopColor="#C9A84C" stopOpacity="0.12" />
                    <Stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={45} cy={45} r={45} fill="url(#crownGlow)" />
              </Svg>
            </Animated.View>
            <View style={styles.crownRing} />
            <Text style={styles.crownIcon}>✦</Text>
          </View>

          <Text style={styles.appName}>LUNARA</Text>
          <Text style={styles.headline}>{t("premium.headline")}</Text>
          <Text style={styles.subheadline}>{t("premium.subheadline")}</Text>
        </View>

        {/* ── Ornament ───────────────────────────────── */}
        <View style={styles.ornament}>
          <View style={styles.ornLine} />
          <Text style={styles.ornCenter}>✦  ✦  ✦</Text>
          <View style={styles.ornLine} />
        </View>

        {/* ── Features description ───────────────────── */}
        <Animated.View
          style={[
            styles.featuresDesc,
            {
              opacity: descAnim,
              transform: [{ translateY: descAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <Text style={styles.featuresDescText}>{t("premium.featuresDesc")}</Text>
        </Animated.View>

        {/* ── Pricing ────────────────────────────────── */}
        <View style={styles.pricingCards}>
          {PLANS.map((plan) => (
            <View key={plan.id} style={plan.popular ? styles.planWrapperPopular : styles.planWrapper}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  plan.popular && styles.planCardPopular,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.8}
              >
                {plan.popular && (
                  <View style={styles.popularBadgeWrap}>
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>{t("premium.popularBadge")}</Text>
                    </View>
                  </View>
                )}
                <View style={styles.planLeft}>
                  <View style={[styles.radioRing, selectedPlan === plan.id && styles.radioRingSelected]}>
                    {selectedPlan === plan.id && <View style={styles.radioDot} />}
                  </View>
                  <View>
                    <Text style={styles.planLabel}>{t(`premium.plans.${plan.id}.label`)}</Text>
                    <Text style={styles.planSublabel}>{t(`premium.plans.${plan.id}.sublabel`)}</Text>
                  </View>
                </View>
                <View style={styles.planRight}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{t(`premium.plans.${plan.id}.period`)}</Text>
                  {plan.hasSavings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{t(`premium.plans.${plan.id}.savings`)}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ── CTA ────────────────────────────────────── */}
        <View>
          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.88}>
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%"   stopColor="#5a3a10" />
                  <Stop offset="28%"  stopColor="#C9A84C" />
                  <Stop offset="52%"  stopColor="#E8C97A" />
                  <Stop offset="74%"  stopColor="#C9A84C" />
                  <Stop offset="100%" stopColor="#5a3a10" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#btnGrad)" />
            </Svg>
            <Animated.View style={[styles.ctaShimmer, { transform: [{ translateX: shimmerAnim }] }]} />
            <View style={styles.ctaBtnContent}>
              <Text style={styles.ctaText}>{t(`premium.cta.${selectedPlan}`)}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.trialNote}>{t(`premium.trial.${selectedPlan}`)}</Text>
        </View>

        {/* ── Footer ─────────────────────────────────── */}
        <View style={styles.footerLinks}>
          <TouchableOpacity><Text style={styles.footerLink}>{t("premium.footer.privacy")}</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>{t("premium.footer.terms")}</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>{t("premium.footer.restore")}</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
