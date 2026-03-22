import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ViewShot from "react-native-view-shot";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import NatalChartView from "./components/NatalChartView";
import BirthDatePicker from "../onboarding/components/BirthDatePicker";
import TimePicker from "./components/TimePicker";
import LocationSearch from "./components/LocationSearch";
import { useAddPersonForm } from "./hooks/useAddPersonForm";
import { useChartCapture } from "./hooks/useChartCapture";
import { getZodiacInfoForMonthDay } from "./utils";
import { Colors } from "../../utils/theme";
import type { RootStackParamList } from "../../navigation/RootStack";
import { useTranslation } from "react-i18next";

const CAPTURE_SIZE = 400;
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AddPersonScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const pendingNavRef = useRef<{ name: string; zodiac: string; zodiacSymbol: string; birthDate: string } | null>(null);

  const chartCapture = useChartCapture(async () => {
    const params = pendingNavRef.current;
    if (!params) { navigation.goBack(); return; }
    (navigation as any).navigate("MainApp", {
      screen: "PersonDetail",
      params,
    });
  });

  const form = useAddPersonForm((chart, name, month, day, year) => {
    const zodiacInfo = getZodiacInfoForMonthDay(month, day);
    const birthDateStr = `${String(day).padStart(2, "0")} ${MONTHS_SHORT[month - 1]} ${year}`;
    pendingNavRef.current = {
      name,
      zodiac: zodiacInfo?.name ?? "",
      zodiacSymbol: zodiacInfo?.symbol ?? "",
      birthDate: birthDateStr,
    };
    if (chart.svgContent) {
      chartCapture.startCapture(chart.svgContent, name, chart.chartData);
    } else {
      (navigation as any).navigate("MainApp", { screen: "PersonDetail", params: pendingNavRef.current });
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.goldPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("orbit.addPersonTitle")}</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <Text style={styles.sectionLabel}>{t("orbit.name")}</Text>
          <TextInput
            style={styles.nameInput}
            placeholder={t("orbit.namePlaceholder")}
            placeholderTextColor="rgba(212,175,55,0.35)"
            value={form.name}
            onChangeText={form.setName}
            returnKeyType="done"
          />

          {/* Birth Date */}
          <Text style={styles.sectionLabel}>{t("orbit.birthDate")}</Text>
          <BirthDatePicker
            birthDateState={form.birthDate}
            onDateChange={(updates) => form.setBirthDate((prev) => ({ ...prev, ...updates }))}
            onConfirm={() => {}}
            showConfirm={false}
          />

          {/* Birth Time */}
          <Text style={styles.sectionLabel}>{t("orbit.birthTime")}</Text>
          <TimePicker
            hour={form.birthTime.hour}
            minute={form.birthTime.minute}
            onTimeChange={(updates) => form.setBirthTime((prev) => ({ ...prev, ...updates }))}
            onConfirm={() => {}}
            showConfirm={false}
          />

          {/* Birth Location */}
          <Text style={styles.sectionLabel}>{t("orbit.birthLocation")}</Text>
          <LocationSearch
            onLocationSelect={(loc) => form.setBirthLocation(loc)}
            onConfirm={() => {}}
          />

          {/* Error */}
          {form.error && <Text style={styles.errorText}>{form.error}</Text>}

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, (!form.canGenerate || form.isGenerating) && styles.generateButtonDisabled]}
            onPress={form.handleGenerate}
            disabled={!form.canGenerate || form.isGenerating}
            activeOpacity={0.85}
          >
            {form.isGenerating ? (
              <ActivityIndicator color={Colors.bgMain} />
            ) : (
              <Text style={styles.generateButtonText}>{t("orbit.generateChart")}</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Hidden chart capture */}
      {chartCapture.pendingCapture && (
        <View style={[StyleSheet.absoluteFill, styles.hiddenCapture]} pointerEvents="none">
          <ViewShot
            ref={chartCapture.captureViewRef}
            options={{ format: "png", result: "tmpfile" }}
            style={{ width: CAPTURE_SIZE, height: CAPTURE_SIZE }}
          >
            <NatalChartView
              chartData={chartCapture.pendingCapture.chartData}
              size={CAPTURE_SIZE}
            />
          </ViewShot>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0d2e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,175,55,0.2)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.goldPrimary,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.goldPrimary,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  nameInput: {
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.goldPrimary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: 12,
  },
  generateButton: {
    marginHorizontal: 16,
    marginTop: 28,
    backgroundColor: Colors.goldPrimary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a0d2e",
    letterSpacing: 0.5,
  },
  hiddenCapture: {
    opacity: 0,
    left: -9999,
    top: 0,
  },
});
