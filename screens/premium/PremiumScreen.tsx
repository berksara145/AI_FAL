import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
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
import styles, { W } from "./styles";
import { usePremium } from "./hooks/usePremium";
import PolicyModal from "./components/PolicyModal";

const PRIVACY_POLICY = `Privacy Policy

This privacy policy applies to the Lunara app (hereby referred to as "Application") for mobile devices that was created by Berk Sara (hereby referred to as "Service Provider") as a Freemium service. This service is intended for use "AS IS".


Information Collection and Use
The Application collects information when you download and use it. This information may include information such as

• Your device's Internet Protocol address (e.g. IP address)
• The pages of the Application that you visit, the time and date of your visit, the time spent on those pages
• The time spent on the Application
• The operating system you use on your mobile device

The Application does not gather precise information about the location of your mobile device.

The Application uses Artificial Intelligence (AI) technologies to enhance user experience and provide certain features. The AI components may process user data to deliver personalized content, recommendations, or automated functionalities. All AI processing is performed in accordance with this privacy policy and applicable laws. If you have questions about the AI features or data processing, please contact the Service Provider.

The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.

For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to berksara145@gmail.com. The information that the Service Provider request will be retained by them and used as described in this privacy policy.


Third Party Access
Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.

Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:

• Google Play Services
• RevenueCat

The Service Provider may disclose User Provided and Automatically Collected Information:

• as required by law, such as to comply with a subpoena, or similar legal process;
• when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;
• with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.


Opt-Out Rights
You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.


Data Retention Policy
The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at support.lunara.app@gmail.com and they will respond in a reasonable time.


Children
The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.

The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider (support.lunara.app@gmail.com) so that they will be able to take the necessary actions.


Security
The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.


Changes
This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.

This privacy policy is effective as of 2026-03-30.


Your Consent
By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.


Contact Us
If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at support.lunara.app@gmail.com.`;

// ── Component ────────────────────────────────────────────────────────────────
export default function PremiumScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    plans,
    isPremium,
    isLoading,
    isPurchasing,
    selectedPlan,
    setSelectedPlan,
    purchase,
    restore,
  } = usePremium();

  const [privacyVisible, setPrivacyVisible] = useState(false);

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

        {/* ── Free trial banner ──────────────────────── */}
        <View style={styles.trialBanner}>
          <Text style={styles.trialBannerEmoji}>🎁</Text>
          <View style={styles.trialBannerText}>
            <Text style={styles.trialBannerTitle}>{t("premium.trialBanner.title")}</Text>
            <Text style={styles.trialBannerSub}>{t("premium.trialBanner.sub")}</Text>
          </View>
        </View>

        {/* ── Pricing ────────────────────────────────── */}
        {isLoading ? (
          <ActivityIndicator color="#C9A84C" style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.pricingCards}>
            {plans.map((plan) => (
              <View key={plan.id} style={plan.popular ? styles.planWrapperPopular : styles.planWrapper}>
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    plan.popular && styles.planCardPopular,
                    selectedPlan === plan.id && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                  activeOpacity={0.8}
                  disabled={isPurchasing}
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
        )}

        {/* ── CTA ────────────────────────────────────── */}
        <View>
          <TouchableOpacity
            style={[styles.ctaBtn, isPurchasing && { opacity: 0.7 }]}
            activeOpacity={0.88}
            onPress={purchase}
            disabled={isPurchasing || isLoading}
          >
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
              {isPurchasing ? (
                <ActivityIndicator color="#060412" />
              ) : (
                <Text style={styles.ctaText}>
                  {plans.find(p => p.id === selectedPlan)?.trialText
                    ? t(`premium.cta.trial.${selectedPlan}`)
                    : t(`premium.cta.${selectedPlan}`)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.trialNote}>{t("premium.trialNote")}</Text>
          <View style={styles.reassuranceRow}>
            <Text style={styles.reassuranceItem}>✓ {t("premium.reassurance.noCharge")}</Text>
            <Text style={styles.reassuranceItem}>✓ {t("premium.reassurance.cancelAnytime")}</Text>
            <Text style={styles.reassuranceItem}>✓ {t("premium.reassurance.noQuestions")}</Text>
          </View>
        </View>

        {/* ── Footer ─────────────────────────────────── */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => setPrivacyVisible(true)}>
            <Text style={styles.footerLink}>{t("premium.footer.privacy")}</Text>
          </TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>{t("premium.footer.terms")}</Text></TouchableOpacity>
          <TouchableOpacity onPress={restore} disabled={isPurchasing}>
            <Text style={styles.footerLink}>{t("premium.footer.restore")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PolicyModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
        title="Privacy Policy"
        content={PRIVACY_POLICY}
      />
    </View>
  );
}
