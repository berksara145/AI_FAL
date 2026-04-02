import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSettings } from "./hooks/useSettings";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES, changeAppLanguage, type SupportedLanguage } from "../../lib/i18n";
import type { RootStackParamList } from "../../navigation/RootStack";
import { getZodiacInfoForMonthDay } from "../orbit/utils";

import Avatar from "./components/Avatar";
import EditPanel from "./components/EditPanel";
import ListRow from "./components/ListRow";
import { ContentModal, AboutModal } from "./components/ContentModal";
import { styles, C } from "./styles";

function formatDate(year: number | null, month: number | null, day: number | null, notSet: string): string {
  if (!year || !month || !day) return notSet;
  const months = i18n.t("months.short", { returnObjects: true }) as string[];
  return `${day} ${months[month - 1]} ${year}`;
}

function formatTime(hour: number | null, minute: number | null, notSet: string): string {
  if (hour == null || minute == null) return notSet;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const s = useSettings();
  const { t, i18n: i18nInstance } = useTranslation();
  const currentLang = i18nInstance.language as SupportedLanguage;
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  const notSet = t("common.notSet");

  const zodiacInfo =
    s.user?.birth_month != null && s.user?.birth_day != null
      ? getZodiacInfoForMonthDay(s.user.birth_month, s.user.birth_day)
      : null;

  const initial = s.user?.name?.[0] ?? "✦";
  const birthDateStr = formatDate(s.user?.birth_year ?? null, s.user?.birth_month ?? null, s.user?.birth_day ?? null, "");
  const birthTimeStr = formatTime(s.user?.birth_hour ?? null, s.user?.birth_minute ?? null, notSet);
  const birthPlaceStr = s.user?.birth_place_name ?? null;

  const handleClearHistory = () => {
    Alert.alert(
      t("settings.clearHistoryAlertTitle"),
      t("settings.clearHistoryAlertMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.clearHistoryAlertConfirm"),
          style: "destructive",
          onPress: async () => {
            await s.clearHistory();
            Alert.alert(t("settings.clearHistorySuccessTitle"), t("settings.clearHistorySuccessMessage"));
          },
        },
      ]
    );
  };

  const handleContactUs = () => {
    navigation.navigate("ChatSession", {
      feature: "Contact Us",
      mode: "interactive",
      agenda: "You are a helpful support agent for the Lunara astrology app. Listen to the user's feedback, questions, or issues with empathy and give concise, helpful responses. If they report a bug, acknowledge it and thank them for the feedback.",
      initialMessage: "✦ Hi! How can I help you today? Feel free to share any feedback, questions, or issues.",
    });
  };

  if (s.loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>{t("settings.title")}</Text>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.headerDivider} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg }}>
          <ActivityIndicator size="large" color={C.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <View style={styles.headerCircleBtn}>
            <MaterialCommunityIcons name="arrow-left" size={16} color={C.gold} />
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <View style={styles.headerSide} />
      </View>
      <View style={styles.headerDivider} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Profile card ── */}
          <View style={styles.profileCard}>
            <Avatar initial={initial} zodiacImage={zodiacInfo?.image} />

            <Pressable
              onPress={undefined}
              style={styles.nameRow}
            >
              <Text style={[styles.profileName, !s.user?.name && styles.profileNameUnset]}>
                {s.user?.name || notSet}
              </Text>
            </Pressable>

            {birthDateStr ? (
              <Pressable
                onPress={undefined}
                style={styles.datePill}
              >
                <Text style={styles.datePillText}>{birthDateStr}</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={undefined}
                style={[styles.datePill, styles.datePillUnset]}
              >
                <Text style={styles.datePillTextUnset}>{t("settings.birthDate")}</Text>
              </Pressable>
            )}

            {s.editingField === "name" && (
              <View style={styles.profileEditWrap}>
                <EditPanel onSave={s.saveName} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
                  <TextInput
                    style={styles.textInput}
                    value={s.nameBuffer}
                    onChangeText={s.setNameBuffer}
                    placeholder={t("settings.namePlaceholder")}
                    placeholderTextColor={C.textFaint}
                    selectionColor={C.goldBright}
                    autoFocus
                  />
                </EditPanel>
              </View>
            )}

            {s.editingField === "date" && (
              <View style={styles.profileEditWrap}>
                <EditPanel onSave={s.saveDate} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
                  <Text style={styles.editHint}>{t("settings.birthDateHint")}</Text>
                  <View style={styles.dateRow}>
                    <TextInput
                      style={[styles.textInput, styles.dateCell]}
                      value={s.dateBuffer.day}
                      onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, day: v })}
                      placeholder="DD"
                      placeholderTextColor={C.textFaint}
                      selectionColor={C.goldBright}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                      autoFocus
                    />
                    <TextInput
                      style={[styles.textInput, styles.dateCell]}
                      value={s.dateBuffer.month}
                      onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, month: v })}
                      placeholder="MM"
                      placeholderTextColor={C.textFaint}
                      selectionColor={C.goldBright}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                    />
                    <TextInput
                      style={[styles.textInput, styles.yearCell]}
                      value={s.dateBuffer.year}
                      onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, year: v })}
                      placeholder="YYYY"
                      placeholderTextColor={C.textFaint}
                      selectionColor={C.goldBright}
                      keyboardType="number-pad"
                      maxLength={4}
                      textAlign="center"
                    />
                  </View>
                </EditPanel>
              </View>
            )}

            <View style={styles.profileDivider} />

            <View style={styles.birthRow}>
              <Pressable
                style={styles.birthCol}
                onPress={undefined}
              >
                <MaterialCommunityIcons name="clock-outline" size={14} color={`${C.gold}66`} />
                <Text style={styles.birthLabel}>{t("settings.birthTime")}</Text>
                <Text style={[styles.birthValue, birthTimeStr !== notSet && styles.birthValueSet]}>
                  {birthTimeStr}
                </Text>
              </Pressable>

              <View style={styles.birthColDivider} />

              <View style={styles.birthCol}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={`${C.gold}66`} />
                <Text style={styles.birthLabel}>{t("settings.birthPlace")}</Text>
                <Text
                  style={[styles.birthValue, !!birthPlaceStr && styles.birthValueSet]}
                  numberOfLines={1}
                >
                  {birthPlaceStr ?? notSet}
                </Text>
              </View>
            </View>

            {s.editingField === "time" && (
              <View style={styles.profileEditWrap}>
                <EditPanel onSave={s.saveTime} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
                  <Text style={styles.editHint}>{t("settings.birthTimeHint")}</Text>
                  <View style={styles.dateRow}>
                    <TextInput
                      style={[styles.textInput, styles.dateCell]}
                      value={s.timeBuffer.hour}
                      onChangeText={(v) => s.setTimeBuffer({ ...s.timeBuffer, hour: v })}
                      placeholder="HH"
                      placeholderTextColor={C.textFaint}
                      selectionColor={C.goldBright}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                      autoFocus
                    />
                    <Text style={styles.timeSep}>:</Text>
                    <TextInput
                      style={[styles.textInput, styles.dateCell]}
                      value={s.timeBuffer.minute}
                      onChangeText={(v) => s.setTimeBuffer({ ...s.timeBuffer, minute: v })}
                      placeholder="MM"
                      placeholderTextColor={C.textFaint}
                      selectionColor={C.goldBright}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                    />
                  </View>
                </EditPanel>
              </View>
            )}
          </View>

          {/* ── Language ── */}
          <SectionLabel label={t("settings.language")} />
          <View style={styles.card}>
            <View style={styles.langToggle}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[styles.langOpt, currentLang === lang.code && styles.langOptActive]}
                  onPress={() => changeAppLanguage(lang.code)}
                >
                  <Text style={[styles.langOptText, currentLang === lang.code && styles.langOptTextActive]}>
                    {lang.nativeLabel}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Data ── */}
          <SectionLabel label={t("settings.data")} />
          <View style={styles.card}>
            <ListRow
              icon="delete-outline"
              iconBg={C.dangerBg}
              iconBorder={C.dangerBorder}
              iconColor={C.danger}
              title={t("settings.clearHistory")}
              subtitle={t("settings.clearHistoryDesc")}
              titleColor={C.danger}
              subtitleColor={`${C.danger}88`}
              onPress={handleClearHistory}
            />
          </View>

          {/* ── Support ── */}
          <SectionLabel label={t("settings.support")} />
          <View style={styles.card}>
            <ListRow
              icon="message-outline"
              iconBg={`${C.gold}14`}
              iconBorder={`${C.gold}28`}
              iconColor={C.gold}
              title={t("settings.contactUs")}
              subtitle={t("settings.contactUsDesc")}
              onPress={handleContactUs}
            />
            <ListRow
              icon="information-outline"
              iconBg={`${C.gold}14`}
              iconBorder={`${C.gold}28`}
              iconColor={C.gold}
              title={t("settings.about")}
              subtitle={t("settings.aboutDesc", { defaultValue: "Version & legal info" })}
              onPress={() => setShowAbout(true)}
              borderTop
            />
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ContentModal
        visible={legalModal === "terms"}
        title={t("settings.termsTitle")}
        body={t("settings.termsBody")}
        onClose={() => setLegalModal(null)}
      />
      <ContentModal
        visible={legalModal === "privacy"}
        title={t("settings.privacyTitle")}
        body={t("settings.privacyBody")}
        onClose={() => setLegalModal(null)}
      />
      <AboutModal
        visible={showAbout}
        onClose={() => setShowAbout(false)}
        onTerms={() => { setShowAbout(false); setTimeout(() => setLegalModal("terms"), 350); }}
        onPrivacy={() => { setShowAbout(false); setTimeout(() => setLegalModal("privacy"), 350); }}
      />
    </SafeAreaView>
  );
}
