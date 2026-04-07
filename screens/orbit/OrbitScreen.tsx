import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { useTranslation } from "react-i18next";

import { OrbitNode } from "./OrbitNode";
import { getNodePosition, getZodiacInfoForMonthDay } from "./utils";
import { styles } from "./styles";
import { useOrbitNodes, personToBirthDate } from "./hooks/useOrbitNodes";
import { CENTER_SIZE } from "./constants";

export default function OrbitScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const rootNav = (navigation.getParent?.()?.getParent?.() ?? navigation.getParent?.()) as
    | NativeStackNavigationProp<RootStackParamList>
    | undefined;

  const { nodes, selfPerson } = useOrbitNodes();
  const GLOW_SIZE = CENTER_SIZE * 2.0;

  const selfHasChart = !!selfPerson?.chart_gpt_json;
  const hasOthers = nodes.some((n) => n.type === "person");
  // Step 1: user exists but hasn't generated their own chart yet
  const showYouFirst = !!selfPerson && !selfHasChart;
  // Step 2: user chart done but no one in orbit yet
  const showAddPrompt = selfHasChart && !hasOthers;

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (showYouFirst || showAddPrompt) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      pulseAnim.setValue(0);
    }
    return () => loopRef.current?.stop();
  }, [showYouFirst, showAddPrompt]);

  const glowOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const glowScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  const navigateToAddPerson = () =>
    rootNav?.navigate("ChatSession", { feature: "birthMap", mode: "interactive" });

  return (
    <View style={styles.container}>
      <View style={styles.orbitWrapper}>
        <View style={styles.outerOrbit} />
        <View style={styles.innerOrbit} />

        <View style={styles.centerWrapper}>
          {/* Soft radial glow — always visible, pulses when chart not yet generated */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.centerGlowContainer,
              showYouFirst
                ? { opacity: glowOpacity, transform: [{ scale: glowScale }] }
                : { opacity: 0.65 },
            ]}
          >
            <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
              <Defs>
                <RadialGradient id="youGlow" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
                  <Stop offset="0%" stopColor="#FADA86" stopOpacity="0.55" />
                  <Stop offset="40%" stopColor="#FADA86" stopOpacity="0.22" />
                  <Stop offset="75%" stopColor="#FADA86" stopOpacity="0.06" />
                  <Stop offset="100%" stopColor="#FADA86" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#youGlow)" />
            </Svg>
          </Animated.View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.centerCircle}
            disabled={!selfPerson}
            onPress={() => {
              if (!selfPerson) return;
              if (!selfHasChart) {
                rootNav?.navigate("ChatSession", {
                  feature: "birthMap",
                  mode: "interactive",
                  personName: selfPerson.name ?? undefined,
                  birthDate: personToBirthDate(selfPerson),
                });
              } else {
                const zodiacInfo =
                  selfPerson.birth_month != null && selfPerson.birth_day != null
                    ? getZodiacInfoForMonthDay(selfPerson.birth_month, selfPerson.birth_day)
                    : null;
                navigation.navigate("PersonDetail", {
                  name: selfPerson.name ?? "You",
                  zodiac: zodiacInfo?.name ?? "",
                  zodiacSymbol: zodiacInfo?.symbol ?? "",
                  birthDate: personToBirthDate(selfPerson),
                });
              }
            }}
          >
            <Text style={styles.centerLabel}>{t("orbit.you")}</Text>
          </TouchableOpacity>
        </View>

        {nodes.map((node) =>
          node.type === "add" ? (
            <OrbitNode
              key={node.id}
              label=""
              style={getNodePosition(node.angle)}
              isAddButton
              onPress={navigateToAddPerson}
            />
          ) : (
            <OrbitNode
              key={node.id}
              label={node.label}
              subtitle={node.subtitle}
              imageSource={node.imageSource}
              style={getNodePosition(node.angle)}
              onPress={() =>
                navigation.navigate("PersonDetail", {
                  name: node.label,
                  zodiac: node.zodiac,
                  zodiacSymbol: node.zodiacSymbol,
                  birthDate: node.birthDate,
                })
              }
            />
          )
        )}
      </View>

      <View style={styles.pageDescription}>
        <Text style={styles.pageDescriptionTitle}>{t("orbit.celestialCircle")}</Text>
        <Text style={styles.pageDescriptionText}>
          {showYouFirst ? t("orbit.tapYouPrompt") : t("orbit.addPeoplePrompt")}
        </Text>
        {hasOthers && (
          <Text style={styles.pageDescriptionHint}>{t("orbit.tapPersonHint")}</Text>
        )}
      </View>

      {/* Step 2: self chart done — prompt to add first person */}
      {showAddPrompt && (
        <View style={styles.addPromptCard}>
          <Text style={styles.addPromptTitle}>{t("orbit.whosInYourOrbit")}</Text>
          <Text style={styles.addPromptText}>{t("orbit.addPromptText")}</Text>
          <View style={styles.addPromptButtonWrapper}>
            <Animated.View style={[styles.addPromptButtonGlow, { opacity: glowOpacity }]} />
            <TouchableOpacity style={styles.addPromptButton} activeOpacity={0.85} onPress={navigateToAddPerson}>
              <Text style={styles.addPromptButtonText}>{t("orbit.addPerson")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
