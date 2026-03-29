import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Easing,
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

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:            "#080314",
  cardBg:        "#0f0825",
  headerBg:      "#0d0520",
  gold:          "#c8922a",
  goldBright:    "#e8c060",
  text:          "#f0e0b0",
  textMuted:     "rgba(200,170,120,0.65)",
  textFaint:     "rgba(200,170,120,0.35)",
  border:        "rgba(200,146,42,0.2)",
  borderFaint:   "rgba(200,146,42,0.12)",
  borderFaintest:"rgba(200,146,42,0.08)",
  purple:        "rgba(120,80,200,0.15)",
  purpleBorder:  "rgba(140,100,220,0.3)",
  purpleText:    "#b090e8",
  danger:        "#e05050",
  dangerBg:      "rgba(180,40,40,0.12)",
  dangerBorder:  "rgba(180,40,40,0.2)",
} as const;

function formatDate(year: number | null, month: number | null, day: number | null, notSet: string): string {
  if (!year || !month || !day) return notSet;
  const months = i18n.t("months.short", { returnObjects: true }) as string[];
  return `${day} ${months[month - 1]} ${year}`;
}

function formatTime(hour: number | null, minute: number | null, notSet: string): string {
  if (hour == null || minute == null) return notSet;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// ── Avatar with spinning gold ring ────────────────────────────────────────────

function Avatar({ initial }: { initial: string }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.avatarWrap}>
      {/* Spinning dashed outer ring */}
      <Animated.View style={[styles.avatarSpinRing, { transform: [{ rotate: spin }] }]} />
      {/* Solid inner gold ring */}
      <View style={styles.avatarRing}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial.toUpperCase()}</Text>
        </View>
      </View>
      {/* Camera badge */}
      <View style={styles.cameraBadge}>
        <MaterialCommunityIcons name="camera" size={11} color={C.gold} />
      </View>
    </View>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

// ── List row ──────────────────────────────────────────────────────────────────

function ListRow({
  icon,
  iconBg,
  iconBorder,
  iconColor,
  title,
  subtitle,
  titleColor,
  subtitleColor,
  onPress,
  borderTop,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  onPress?: () => void;
  borderTop?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.listRow, borderTop && styles.listRowBorderTop]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}>
        <MaterialCommunityIcons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, titleColor ? { color: titleColor } : null]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSub, subtitleColor ? { color: subtitleColor } : null]}>{subtitle}</Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={16} color={`${C.gold}55`} />
    </TouchableOpacity>
  );
}

// ── Edit panel ────────────────────────────────────────────────────────────────

function EditPanel({
  children,
  onSave,
  onCancel,
  saving,
  error,
}: {
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.editPanel}>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.editActions}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={onSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={C.goldBright} />
            : <Text style={styles.saveBtnText}>{t("common.save")}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

// ── Legal / About modal ───────────────────────────────────────────────────────

function ContentModal({
  visible,
  title,
  body,
  onClose,
}: {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalRule} />
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            <Text style={styles.modalBody}>{body}</Text>
          </ScrollView>
          <Pressable style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseBtnText}>{t("settings.close")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── About modal ───────────────────────────────────────────────────────────────

function AboutModal({
  visible,
  onClose,
  onTerms,
  onPrivacy,
}: {
  visible: boolean;
  onClose: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.aboutContent}>
            <Text style={styles.aboutStar}>✦</Text>
            <Text style={styles.aboutApp}>LUNARA</Text>
            <Text style={styles.aboutTagline}>{t("settings.tagline")}</Text>
            <View style={styles.aboutRule} />
            <Text style={styles.aboutSub}>{t("settings.credit")}</Text>
          </View>
          <View style={styles.aboutLegalRow}>
            <Pressable style={styles.aboutLegalBtn} onPress={onTerms}>
              <Text style={styles.aboutLegalBtnText}>📄  {t("settings.termsOfService")}</Text>
            </Pressable>
            <Pressable style={styles.aboutLegalBtn} onPress={onPrivacy}>
              <Text style={styles.aboutLegalBtnText}>🔒  {t("settings.privacyPolicy")}</Text>
            </Pressable>
          </View>
          <Pressable style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseBtnText}>{t("settings.close")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

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
        <View style={[styles.header]}>
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

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <View style={styles.headerCircleBtn}>
            <MaterialCommunityIcons name="arrow-left" size={16} color={C.gold} />
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <View style={styles.headerSide}>
          <View style={styles.headerCircleBtn}>
            <MaterialCommunityIcons name="cog-outline" size={16} color={C.gold} />
          </View>
        </View>
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
            <Avatar initial={initial} />

            {/* Name */}
            <Pressable
              onPress={s.editingField === "name" ? undefined : () => s.startEditing("name")}
              style={styles.nameRow}
            >
              <Text style={[styles.profileName, !s.user?.name && styles.profileNameUnset]}>
                {s.user?.name || notSet}
              </Text>
              {s.user?.name ? (
                <View style={styles.editIconWrap}>
                  <MaterialCommunityIcons name="pencil-outline" size={9} color={C.gold} />
                </View>
              ) : null}
            </Pressable>

            {/* Zodiac sign badge */}
            {zodiacInfo ? (
              <View style={styles.signBadge}>
                <View style={styles.signSymbolWrap}>
                  <Text style={styles.signSymbol}>{zodiacInfo.symbol}</Text>
                </View>
                <Text style={styles.signName}>{zodiacInfo.name}</Text>
              </View>
            ) : null}

            {/* Birth date pill */}
            {birthDateStr ? (
              <Pressable
                onPress={s.editingField === "date" ? undefined : () => s.startEditing("date")}
                style={styles.datePill}
              >
                <Text style={styles.datePillText}>{birthDateStr}</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={s.editingField === "date" ? undefined : () => s.startEditing("date")}
                style={[styles.datePill, styles.datePillUnset]}
              >
                <Text style={styles.datePillTextUnset}>{t("settings.birthDate")}</Text>
              </Pressable>
            )}

            {/* Edit: name */}
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

            {/* Edit: birth date */}
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

            {/* Divider */}
            <View style={styles.profileDivider} />

            {/* Birth time + place — two-column */}
            <View style={styles.birthRow}>
              <Pressable
                style={styles.birthCol}
                onPress={s.editingField === "time" ? undefined : () => s.startEditing("time")}
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

            {/* Edit: birth time */}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.headerBg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.headerBg,
  },
  headerSide: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 3,
    textAlign: "center",
    textTransform: "uppercase",
  },
  headerDivider: {
    height: 0.5,
    backgroundColor: C.border,
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${C.gold}14`,
    borderWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  sectionLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: `${C.gold}66`,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 10,
    paddingLeft: 2,
  },

  card: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: `${C.gold}26`,
    overflow: "hidden",
  },

  rowPressed: { backgroundColor: `${C.gold}0f` },

  // ── Profile card ──
  profileCard: {
    backgroundColor: C.cardBg,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 12,
  },

  // Avatar
  avatarWrap: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarSpinRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: `${C.gold}55`,
    borderStyle: "dashed",
  },
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  avatarCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(30,13,64,1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: C.goldBright,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1a0a35",
    borderWidth: 1.5,
    borderColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  // Name
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 1,
  },
  profileNameUnset: {
    color: C.textFaint,
    fontStyle: "italic",
    fontWeight: "400",
    fontSize: 17,
  },
  editIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${C.gold}1e`,
    borderWidth: 0.5,
    borderColor: `${C.gold}4d`,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sign badge
  signBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.purple,
    borderWidth: 0.5,
    borderColor: C.purpleBorder,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  signSymbolWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(140,100,220,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  signSymbol: {
    fontSize: 11,
    color: C.purpleText,
  },
  signName: {
    fontSize: 14,
    color: C.purpleText,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },

  // Date pill
  datePill: {
    backgroundColor: `${C.gold}14`,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  datePillUnset: {
    backgroundColor: `${C.gold}0a`,
    borderColor: `${C.gold}1a`,
  },
  datePillText: {
    fontSize: 14,
    color: `rgba(200,170,100,0.8)`,
    letterSpacing: 0.5,
  },
  datePillTextUnset: {
    fontSize: 14,
    color: C.textFaint,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },

  // Profile edit wrap
  profileEditWrap: {
    width: "100%",
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: C.borderFaint,
    paddingTop: 14,
  },

  // Profile divider
  profileDivider: {
    width: "100%",
    height: 0.5,
    backgroundColor: C.borderFaint,
    marginTop: 4,
  },

  // Birth time + place columns
  birthRow: {
    flexDirection: "row",
    width: "100%",
  },
  birthCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  birthColDivider: {
    width: 0.5,
    backgroundColor: C.borderFaint,
    alignSelf: "stretch",
  },
  birthLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    color: `${C.gold}80`,
    textTransform: "uppercase",
  },
  birthValue: {
    fontSize: 13,
    color: C.textFaint,
    fontStyle: "italic",
  },
  birthValueSet: {
    color: "rgba(200,170,120,0.9)",
    fontStyle: "italic",
  },

  // ── Language ──
  langToggle: {
    flexDirection: "row",
    padding: 6,
    gap: 4,
  },
  langOpt: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  langOptActive: {
    backgroundColor: `${C.gold}26`,
    borderWidth: 0.5,
    borderColor: `${C.gold}59`,
  },
  langOptText: {
    fontSize: 13,
    letterSpacing: 1,
    color: C.textFaint,
    fontWeight: "500",
  },
  langOptTextActive: {
    color: C.goldBright,
    fontWeight: "700",
  },

  // ── List rows ──
  listRowBorderTop: {
    borderTopWidth: 0.5,
    borderTopColor: C.borderFaintest,
  },
  listRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    alignSelf: "stretch",
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: { flex: 1, flexShrink: 1 },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 12,
    color: C.textFaint,
    fontStyle: "italic",
    letterSpacing: 0.2,
  },

  // ── Edit panels ──
  editPanel: { gap: 10 },
  editHint: {
    fontSize: 11,
    color: C.textFaint,
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
  },
  dateRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  dateCell: { flex: 1 },
  yearCell: { flex: 1.6 },
  timeSep: {
    fontSize: 22,
    color: C.gold,
    fontWeight: "200",
  },
  editActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: "500",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.headerBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${C.gold}59`,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 12,
    color: C.danger,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: C.border,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  modalRule: {
    height: 0.5,
    backgroundColor: C.borderFaint,
    marginBottom: 16,
  },
  modalScroll: { marginBottom: 20 },
  modalBody: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },
  modalCloseBtn: {
    backgroundColor: C.headerBg,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: `${C.gold}59`,
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 0.3,
  },

  // ── About modal content ──
  aboutContent: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  aboutStar: {
    fontSize: 26,
    color: C.gold,
    marginBottom: 2,
  },
  aboutApp: {
    fontSize: 22,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 6,
    marginTop: 2,
  },
  aboutTagline: {
    fontSize: 14,
    color: C.textMuted,
    letterSpacing: 0.3,
  },
  aboutRule: {
    width: 40,
    height: 0.5,
    backgroundColor: C.borderFaint,
    marginVertical: 6,
  },
  aboutSub: {
    fontSize: 12,
    color: `${C.gold}66`,
    letterSpacing: 0.3,
  },
  aboutLegalRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  aboutLegalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: `${C.gold}0f`,
    borderWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
  },
  aboutLegalBtnText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
