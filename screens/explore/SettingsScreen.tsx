import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
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
import { ChatColors } from "../../utils/theme";
import { useSettings } from "./hooks/useSettings";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES, changeAppLanguage, type SupportedLanguage } from "../../lib/i18n";
import type { RootStackParamList } from "../../navigation/RootStack";
import { getZodiacInfoForMonthDay } from "../orbit/utils";

function formatDate(year: number | null, month: number | null, day: number | null, notSet: string): string {
  if (!year || !month || !day) return notSet;
  const months = i18n.t("months.short", { returnObjects: true }) as string[];
  return `${day} ${months[month - 1]} ${year}`;
}

function formatTime(hour: number | null, minute: number | null, notSet: string): string {
  if (hour == null || minute == null) return notSet;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// ── Spinning avatar ring ──────────────────────────────────────────────────────

function AvatarRing({ initial }: { initial: string }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.avatarWrap}>
      <Animated.View style={[styles.avatarRing, { transform: [{ rotate: spin }] }]} />
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitial}>{initial.toUpperCase()}</Text>
      </View>
    </View>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

// ── Action row (icon + text + chevron) ────────────────────────────────────────

function ActionRow({
  icon,
  iconBg,
  label,
  subtitle,
  onPress,
  danger,
  hideChevron,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconBg: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  hideChevron?: boolean;
}) {
  const labelColor = danger ? "#b33b3b" : ChatColors.lunaraText;
  const subtitleColor = danger ? "#b33b3b88" : "rgba(15,9,32,0.52)";

  return (
    <Pressable
      style={({ pressed }) => [styles.actionRow, pressed && onPress ? styles.rowPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={18} color={danger ? "#b33b3b" : ChatColors.lunaraLabel} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionLabel, { color: labelColor }]}>{label}</Text>
        {subtitle ? <Text style={[styles.actionSubtitle, { color: subtitleColor }]}>{subtitle}</Text> : null}
      </View>
      {!hideChevron && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={danger ? "#b33b3b55" : "rgba(15,9,32,0.25)"}
        />
      )}
    </Pressable>
  );
}

// ── Field card (for birth time / birth place grid) ────────────────────────────

function FieldCard({
  icon,
  label,
  value,
  notSet,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value?: string;
  notSet: string;
  onPress?: () => void;
}) {
  const isSet = !!value;
  return (
    <Pressable
      style={({ pressed }) => [styles.fieldCard, pressed && onPress ? styles.rowPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.fieldCardIcon}>
        <MaterialCommunityIcons name={icon} size={16} color={ChatColors.lunaraLabel} />
      </View>
      <Text style={styles.fieldCardLabel}>{label}</Text>
      <Text style={[styles.fieldCardValue, !isSet && styles.fieldCardValueUnset]}>
        {isSet ? value : notSet}
      </Text>
      {onPress && (
        <View style={styles.fieldCardPencil}>
          <MaterialCommunityIcons name="pencil-outline" size={12} color="rgba(15,9,32,0.28)" />
        </View>
      )}
    </Pressable>
  );
}

// ── Inline edit panel ─────────────────────────────────────────────────────────

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
            ? <ActivityIndicator size="small" color={ChatColors.sendActive} />
            : <Text style={styles.saveBtnText}>{t("common.save")}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

// ── Legal modal ───────────────────────────────────────────────────────────────

function LegalModal({
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

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const s = useSettings();
  const { t, i18n: i18nInstance } = useTranslation();
  const currentLang = i18nInstance.language as SupportedLanguage;
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const notSet = t("common.notSet");

  const zodiacInfo =
    s.user?.birth_month != null && s.user?.birth_day != null
      ? getZodiacInfoForMonthDay(s.user.birth_month, s.user.birth_day)
      : null;

  const initial = s.user?.name?.[0] ?? "✦";
  const birthDateStr = formatDate(s.user?.birth_year ?? null, s.user?.birth_month ?? null, s.user?.birth_day ?? null, "");
  const birthTimeStr = formatTime(s.user?.birth_hour ?? null, s.user?.birth_minute ?? null, notSet);
  const birthPlaceStr = s.user?.birth_place_name ?? undefined;

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
        <StatusBar barStyle="light-content" backgroundColor={ChatColors.headerBg} />
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>{t("settings.title")}</Text>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.headerDivider} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: ChatColors.bg }}>
          <ActivityIndicator size="large" color={ChatColors.lunaraLabel} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={ChatColors.headerBg} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={ChatColors.sendActive} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <View style={styles.headerSide}>
          <Text style={styles.headerOrb}>⚙</Text>
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
            <AvatarRing initial={initial} />

            <Pressable
              onPress={s.editingField === "name" ? undefined : () => s.startEditing("name")}
              style={styles.profileNameWrap}
            >
              <Text style={[styles.profileName, !s.user?.name && styles.profileNameUnset]}>
                {s.user?.name || notSet}
              </Text>
              {s.user?.name ? (
                <MaterialCommunityIcons name="pencil-outline" size={13} color="rgba(15,9,32,0.28)" style={{ marginLeft: 6, marginTop: 2 }} />
              ) : null}
            </Pressable>

            {zodiacInfo ? (
              <Text style={styles.profileZodiac}>
                {zodiacInfo.symbol}  {zodiacInfo.name}
              </Text>
            ) : null}

            {birthDateStr ? (
              <Pressable
                onPress={s.editingField === "date" ? undefined : () => s.startEditing("date")}
                style={styles.profileDatePill}
              >
                <Text style={styles.profileDateText}>{birthDateStr}</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={s.editingField === "date" ? undefined : () => s.startEditing("date")}
                style={[styles.profileDatePill, styles.profileDatePillUnset]}
              >
                <Text style={styles.profileDateTextUnset}>{t("settings.birthDate")}</Text>
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
                    placeholderTextColor="rgba(212,175,55,0.35)"
                    selectionColor={ChatColors.sendActive}
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
                      placeholderTextColor="rgba(212,175,55,0.35)"
                      selectionColor={ChatColors.sendActive}
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
                      placeholderTextColor="rgba(212,175,55,0.35)"
                      selectionColor={ChatColors.sendActive}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                    />
                    <TextInput
                      style={[styles.textInput, styles.yearCell]}
                      value={s.dateBuffer.year}
                      onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, year: v })}
                      placeholder="YYYY"
                      placeholderTextColor="rgba(212,175,55,0.35)"
                      selectionColor={ChatColors.sendActive}
                      keyboardType="number-pad"
                      maxLength={4}
                      textAlign="center"
                    />
                  </View>
                </EditPanel>
              </View>
            )}

            {/* ── Birth time + place inside profile card ── */}
            <View style={styles.profileInnerDivider} />
            <View style={styles.fieldGrid}>
              <View style={styles.fieldGridCell}>
                <FieldCard
                  icon="clock-outline"
                  label={t("settings.birthTime")}
                  value={birthTimeStr !== notSet ? birthTimeStr : undefined}
                  notSet={notSet}
                  onPress={s.editingField === "time" ? undefined : () => s.startEditing("time")}
                />
              </View>
              <View style={styles.fieldGridCell}>
                <FieldCard
                  icon="map-marker-outline"
                  label={t("settings.birthPlace")}
                  value={birthPlaceStr}
                  notSet={notSet}
                />
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
                      placeholderTextColor="rgba(212,175,55,0.35)"
                      selectionColor={ChatColors.sendActive}
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
                      placeholderTextColor="rgba(212,175,55,0.35)"
                      selectionColor={ChatColors.sendActive}
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
          <SectionTitle label={t("settings.language")} />
          <View style={styles.card}>
            <View style={styles.languageRow}>
              {SUPPORTED_LANGUAGES.map((lang, idx) => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.langButton,
                    currentLang === lang.code && styles.langButtonActive,
                    idx > 0 && styles.langButtonBorder,
                  ]}
                  onPress={() => changeAppLanguage(lang.code)}
                >
                  <Text style={[styles.langButtonText, currentLang === lang.code && styles.langButtonTextActive]}>
                    {lang.nativeLabel}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Data ── */}
          <SectionTitle label={t("settings.data")} />
          <View style={styles.card}>
            <ActionRow
              icon="delete-outline"
              iconBg="rgba(229,115,115,0.12)"
              label={t("settings.clearHistory")}
              subtitle={t("settings.clearHistoryDesc")}
              onPress={handleClearHistory}
              danger
            />
          </View>

          {/* ── Support ── */}
          <SectionTitle label={t("settings.support")} />
          <View style={styles.card}>
            <ActionRow
              icon="message-outline"
              iconBg="rgba(212,175,55,0.12)"
              label={t("settings.contactUs")}
              subtitle={t("settings.contactUsDesc")}
              onPress={handleContactUs}
            />
          </View>

          {/* Legal side-by-side */}
          <View style={styles.legalRow}>
            <Pressable
              style={({ pressed }) => [styles.legalCard, pressed && styles.rowPressed]}
              onPress={() => setLegalModal("terms")}
            >
              <Text style={styles.legalEmoji}>📄</Text>
              <Text style={styles.legalLabel}>{t("settings.termsOfService")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color="rgba(15,9,32,0.25)" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.legalCard, pressed && styles.rowPressed]}
              onPress={() => setLegalModal("privacy")}
            >
              <Text style={styles.legalEmoji}>🔒</Text>
              <Text style={styles.legalLabel}>{t("settings.privacyPolicy")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color="rgba(15,9,32,0.25)" />
            </Pressable>
          </View>

          {/* ── About ── */}
          <SectionTitle label={t("settings.about")} />
          <View style={styles.card}>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutStar}>✦</Text>
              <Text style={styles.aboutApp}>LUNARA</Text>
              <Text style={styles.aboutTagline}>{t("settings.tagline")}</Text>
              <View style={styles.aboutRule} />
              <Text style={styles.aboutSub}>{t("settings.credit")}</Text>
            </View>
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <LegalModal
        visible={legalModal === "terms"}
        title={t("settings.termsTitle")}
        body={t("settings.termsBody")}
        onClose={() => setLegalModal(null)}
      />
      <LegalModal
        visible={legalModal === "privacy"}
        title={t("settings.privacyTitle")}
        body={t("settings.privacyBody")}
        onClose={() => setLegalModal(null)}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChatColors.headerBg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: ChatColors.headerBg,
    gap: 14,
  },
  headerSide: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: "600",
    color: ChatColors.sendActive,
    letterSpacing: 0.5,
    textAlign: "center",
    textShadowColor: "rgba(201,168,76,0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  headerOrb: {
    fontSize: 18,
    color: "rgba(201,168,76,0.5)",
  },
  headerDivider: {
    height: 1,
    backgroundColor: ChatColors.sendActive,
    opacity: 0.3,
  },

  scroll: { flex: 1, backgroundColor: ChatColors.bg },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: ChatColors.lunaraLabel,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 10,
    opacity: 0.8,
  },

  card: {
    backgroundColor: ChatColors.inputBarBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(100,80,40,0.22)",
    overflow: "hidden",
  },

  rowPressed: { backgroundColor: "rgba(100,80,40,0.08)" },

  // ── Profile card ──
  profileCard: {
    backgroundColor: ChatColors.inputBarBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(100,80,40,0.22)",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 10,
  },

  // Avatar
  avatarWrap: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: ChatColors.lunaraLabel,
    borderStyle: "dashed",
    opacity: 0.5,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(122,88,16,0.12)",
    borderWidth: 1,
    borderColor: "rgba(122,88,16,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: "700",
    color: ChatColors.lunaraLabel,
  },

  // Profile info
  profileNameWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: ChatColors.lunaraText,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  profileNameUnset: {
    color: "rgba(15,9,32,0.3)",
    fontStyle: "italic",
    fontSize: 18,
    fontWeight: "400",
  },
  profileZodiac: {
    fontSize: 14,
    color: "rgba(15,9,32,0.55)",
    letterSpacing: 0.3,
  },
  profileDatePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(122,88,16,0.1)",
    borderWidth: 1,
    borderColor: "rgba(122,88,16,0.25)",
  },
  profileDatePillUnset: {
    backgroundColor: "rgba(122,88,16,0.05)",
    borderColor: "rgba(122,88,16,0.15)",
  },
  profileDateText: {
    fontSize: 13,
    color: ChatColors.lunaraLabel,
    letterSpacing: 0.3,
  },
  profileDateTextUnset: {
    fontSize: 13,
    color: "rgba(15,9,32,0.3)",
    letterSpacing: 0.3,
    fontStyle: "italic",
  },
  profileEditWrap: {
    width: "100%",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: ChatColors.divider,
    paddingTop: 14,
  },
  profileInnerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: ChatColors.divider,
    marginTop: 6,
  },

  // ── Field grid (birth time + place) ──
  fieldGrid: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 12,
  },
  fieldGridCell: {
    flex: 1,
  },
  fieldCard: {
    backgroundColor: "rgba(100,80,40,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(100,80,40,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  fieldCardIcon: {
    marginBottom: 4,
  },
  fieldCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: ChatColors.lunaraLabel,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  fieldCardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: ChatColors.lunaraText,
    marginTop: 2,
  },
  fieldCardValueUnset: {
    color: "rgba(15,9,32,0.3)",
    fontStyle: "italic",
    fontWeight: "400",
    fontSize: 13,
  },
  fieldCardPencil: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  // ── Language ──
  languageRow: { flexDirection: "row" },
  langButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  langButtonBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(100,80,40,0.22)",
  },
  langButtonActive: {
    backgroundColor: ChatColors.headerBg,
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(15,9,32,0.45)",
  },
  langButtonTextActive: {
    color: ChatColors.sendActive,
    fontWeight: "700",
  },

  // ── Action rows ──
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionContent: { flex: 1, gap: 2 },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  actionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.1,
  },

  // ── Legal side-by-side ──
  legalRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  legalCard: {
    flex: 1,
    backgroundColor: ChatColors.inputBarBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(100,80,40,0.22)",
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legalEmoji: {
    fontSize: 20,
  },
  legalLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: ChatColors.lunaraText,
    letterSpacing: 0.1,
  },

  // ── About ──
  aboutContent: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 6,
  },
  aboutStar: {
    fontSize: 28,
    color: ChatColors.lunaraLabel,
    marginBottom: 2,
  },
  aboutApp: {
    fontSize: 22,
    fontWeight: "700",
    color: ChatColors.lunaraLabel,
    letterSpacing: 6,
    marginTop: 2,
  },
  aboutTagline: {
    fontSize: 14,
    color: ChatColors.lunaraText,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  aboutRule: {
    width: 40,
    height: 1,
    backgroundColor: ChatColors.divider,
    marginVertical: 6,
  },
  aboutSub: {
    fontSize: 12,
    color: "rgba(15,9,32,0.40)",
    letterSpacing: 0.3,
  },

  // ── Edit panels ──
  editPanel: {
    gap: 10,
  },
  editHint: {
    fontSize: 11,
    color: "rgba(15,9,32,0.45)",
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: ChatColors.inputFieldBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(100,80,40,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: ChatColors.lunaraText,
  },
  dateRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  dateCell: { flex: 1 },
  yearCell: { flex: 1.6 },
  timeSep: {
    fontSize: 22,
    color: ChatColors.lunaraLabel,
    fontWeight: "200",
  },
  editActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(100,80,40,0.30)",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    color: "rgba(15,9,32,0.55)",
    fontWeight: "500",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: ChatColors.headerBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.35)",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: ChatColors.sendActive,
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 12,
    color: "#b33b3b",
  },

  // ── Legal modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: ChatColors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: ChatColors.lunaraLabel,
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 12,
  },
  modalRule: {
    height: 1,
    backgroundColor: ChatColors.divider,
    marginBottom: 16,
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalBody: {
    fontSize: 14,
    color: ChatColors.lunaraText,
    lineHeight: 22,
    opacity: 0.85,
  },
  modalCloseBtn: {
    backgroundColor: ChatColors.headerBg,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.35)",
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: ChatColors.sendActive,
    letterSpacing: 0.3,
  },
});
