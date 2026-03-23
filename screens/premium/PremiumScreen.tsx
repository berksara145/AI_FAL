import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

// ── Static data ──────────────────────────────────────────────────────────────
const PLANS = [
  { id: "weekly",  label: "Haftalık", sublabel: "Her hafta yenilenir",       price: "₺284.99", period: "/ hafta", savings: null,         popular: true  },
  { id: "monthly", label: "Aylık",    sublabel: "Her ay yenilenir",           price: "₺799.99", period: "/ ay",   savings: "%30 tasarruf", popular: false },
  { id: "yearly",  label: "Yıllık",   sublabel: "Yılda bir faturalandırılır", price: "₺4.999",  period: "/ yıl",  savings: "%64 tasarruf", popular: false },
];

const FEATURES = [
  { icon: "🔮", title: "Sınırsız Kozmik Okuma",  desc: "Günlük tarot, astroloji ve kehanet okumalarına sınır olmaksızın eriş." },
  { icon: "🌙", title: "Kişisel Doğum Haritası", desc: "Derinlemesine analiz ve gezegen geçişlerinin hayatına etkisini keşfet." },
  { icon: "⭐", title: "Yıldız Uyumluluğu",      desc: "Sevdiklerinle kozmik bağlantını ve ruh eşini bul." },
  { icon: "🪐", title: "Gezegen Geçişleri",      desc: "Günlük, haftalık ve aylık kozmik tahminlerle bir adım önde ol." },
  { icon: "💫", title: "Reklamsız Deneyim",      desc: "Kesintisiz, saf bir kozmik yolculuk için reklamsız premium erişim." },
];

const CTA_LABELS: Record<string, string> = {
  weekly:  "✦  Premium'u Başlat  ✦",
  monthly: "✦  Aylık Premium'u Başlat  ✦",
  yearly:  "✦  Yıllığa Geç · En İyi Fiyat  ✦",
};

const TRIAL_NOTES: Record<string, string> = {
  weekly:  "İstediğin zaman iptal edebilirsin, soru sorulmaz.",
  monthly: "3 günlük ücretsiz deneme · İstediğin zaman iptal et.",
  yearly:  "Yıllık en iyi fiyat · İptal her zaman mümkün.",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function PremiumScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState("weekly");

  const glowAnim    = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-W * 0.5)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Crown glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Button shimmer sweep
    const runShimmer = () => {
      shimmerAnim.setValue(-W * 0.3);
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: W * 1.1, duration: 900, useNativeDriver: true }),
        Animated.delay(2400),
      ]).start(runShimmer);
    };
    const shimmerTimer = setTimeout(runShimmer, 600);

    // Feature items staggered fade-up
    Animated.stagger(
      80,
      featureAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 480, useNativeDriver: true })
      )
    ).start();

    return () => clearTimeout(shimmerTimer);
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.0, 1] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] });

  return (
    <View style={styles.container}>
      {/* ── All animated background effects ─────────── */}
      <BackgroundScene />

      {/* ── Scrollable content ───────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Crown — SVG RadialGradient glow fades softly at edges */}
          <View style={styles.crownContainer}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { alignItems: "center", justifyContent: "center",
                  opacity: glowOpacity, transform: [{ scale: glowScale }] },
              ]}
              pointerEvents="none"
            >
              <Svg width={100} height={100}>
                <Defs>
                  <RadialGradient id="crownGlow" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
                    <Stop offset="0%"   stopColor="#E8C97A" stopOpacity="1" />
                    <Stop offset="38%"  stopColor="#C9A84C" stopOpacity="0.55" />
                    <Stop offset="72%"  stopColor="#C9A84C" stopOpacity="0.15" />
                    <Stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={50} cy={50} r={50} fill="url(#crownGlow)" />
              </Svg>
            </Animated.View>
            <View style={styles.crownRing} />
            <Text style={styles.crownIcon}>✦</Text>
          </View>

          <Text style={styles.appName}>LUNARA</Text>
          <Text style={styles.headline}>{"Kozmik Rehberliğini\nKeşfet"}</Text>
          <Text style={styles.subheadline}>
            {"Evrenin sana sunduğu sınırsız bilgeliğe\nkapılarını aç."}
          </Text>
        </View>

        {/* Ornament divider */}
        <View style={styles.ornament}>
          <View style={styles.ornLine} />
          <Text style={styles.ornCenter}>✦  ✦  ✦</Text>
          <View style={styles.ornLine} />
        </View>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.title}
              style={[
                styles.featureItem,
                {
                  opacity: featureAnims[i],
                  transform: [{
                    translateY: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [22, 0] }),
                  }],
                },
              ]}
            >
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Testimonial */}
        <View style={styles.testimonial}>
          <Text style={styles.starsRow}>★  ★  ★  ★  ★</Text>
          <Text style={styles.testimonialText}>
            "Lunara hayatımı değiştirdi. Doğum haritam benim hakkımda bilmediğim şeyleri ortaya koydu."
          </Text>
          <Text style={styles.testimonialAuthor}>— Zeynep A., Başak ♍</Text>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <Text style={styles.pricingLabel}>✦  Planını Seç  ✦</Text>
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
                        <Text style={styles.popularBadgeText}>✦ EN POPÜLER</Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.planLeft}>
                    <View style={[styles.radioRing, selectedPlan === plan.id && styles.radioRingSelected]}>
                      {selectedPlan === plan.id && <View style={styles.radioDot} />}
                    </View>
                    <View>
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      <Text style={styles.planSublabel}>{plan.sublabel}</Text>
                    </View>
                  </View>
                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
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
              <Text style={styles.ctaText}>{CTA_LABELS[selectedPlan]}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.trialNote}>{TRIAL_NOTES[selectedPlan]}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footerLinks}>
          <TouchableOpacity><Text style={styles.footerLink}>Gizlilik</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Şartlar</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Geri Yükle</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
