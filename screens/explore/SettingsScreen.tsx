import React, { useState } from "react";
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

function formatDate(year: number | null, month: number | null, day: number | null, notSet: string): string {
  if (!year || !month || !day) return notSet;
  const months = i18n.t("months.short", { returnObjects: true }) as string[];
  return `${day} ${months[month - 1]} ${year}`;
}

function formatTime(hour: number | null, minute: number | null, notSet: string): string {
  if (hour == null || minute == null) return notSet;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// ── Small components ──────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

/** Centered profile field — label above, value below, pencil in corner. */
function ProfileRow({
  label,
  value,
  onEdit,
  notSet,
}: {
  label: string;
  value?: string;
  onEdit?: () => void;
  notSet: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.profileRow, pressed && onEdit ? styles.rowPressed : null]}
      onPress={onEdit}
      disabled={!onEdit}
    >
      <Text style={styles.profileLabel}>{label.toUpperCase()}</Text>
      <Text style={[styles.profileValue, !value && styles.profileValueUnset]}>
        {value || notSet}
      </Text>
      {onEdit && (
        <MaterialCommunityIcons
          name="pencil-outline"
          size={14}
          color="rgba(15,9,32,0.28)"
          style={styles.profilePencil}
        />
      )}
    </Pressable>
  );
}

/** Centered single-column action row — label + optional subtitle, all centered. */
function CenteredRow({
  label,
  subtitle,
  onPress,
  danger,
}: {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.centeredRow, pressed && onPress ? styles.rowPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.centeredRowLabel, danger && { color: "#b33b3b" }]}>{label}</Text>
      {subtitle ? (
        <Text style={[styles.centeredRowSubtitle, danger && { color: "#b33b3b88" }]}>{subtitle}</Text>
      ) : null}
    </Pressable>
  );
}

/** Standard left-aligned row for non-profile sections. */
function InfoRow({
  icon,
  label,
  value,
  onEdit,
  iconColor,
  danger,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value?: string;
  onEdit?: () => void;
  iconColor?: string;
  danger?: boolean;
}) {
  const accent = danger ? "#b33b3b" : (iconColor ?? ChatColors.lunaraLabel);
  return (
    <Pressable
      style={({ pressed }) => [styles.infoRow, pressed && onEdit ? styles.rowPressed : null]}
      onPress={onEdit}
      disabled={!onEdit}
    >
      <View style={[styles.iconBox, { backgroundColor: accent + "22" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={accent} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, danger && { color: "#b33b3b" }]}>{label}</Text>
        {value ? <Text style={styles.infoValue} numberOfLines={1}>{value}</Text> : null}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={16}
        color={danger ? "#b33b3b88" : "rgba(15,9,32,0.25)"}
      />
    </Pressable>
  );
}

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

  const notSet = t("common.notSet");

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
          {/* ── Your Profile ── */}
          <SectionTitle label={t("settings.yourProfile")} />
          <Card>
            {/* 2-column grid for name + birth date */}
            <View style={styles.profileGrid}>
              <View style={styles.profileGridCell}>
                <ProfileRow
                  label={t("settings.name")}
                  value={s.user?.name ?? undefined}
                  onEdit={s.editingField === "name" ? undefined : () => s.startEditing("name")}
                  notSet={notSet}
                />
              </View>
              <View style={styles.profileGridDividerV} />
              <View style={styles.profileGridCell}>
                <ProfileRow
                  label={t("settings.birthDate")}
                  value={formatDate(s.user?.birth_year ?? null, s.user?.birth_month ?? null, s.user?.birth_day ?? null, notSet) !== notSet
                    ? formatDate(s.user?.birth_year ?? null, s.user?.birth_month ?? null, s.user?.birth_day ?? null, notSet)
                    : undefined}
                  onEdit={s.editingField === "date" ? undefined : () => s.startEditing("date")}
                  notSet={notSet}
                />
              </View>
            </View>

            {/* Edit panels for name / date */}
            {s.editingField === "name" && (
              <>
                <View style={styles.profileGridDividerH} />
                <EditPanel onSave={s.saveName} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
                  <TextInput
                    style={styles.textInput}
                    value={s.nameBuffer}
                    onChangeText={s.setNameBuffer}
                    placeholder={t("settings.namePlaceholder")}
                    placeholderTextColor={ChatColors.placeholder}
                    selectionColor={ChatColors.lunaraLabel}
                    autoFocus
                  />
                </EditPanel>
              </>
            )}
            {s.editingField === "date" && (
              <>
                <View style={styles.profileGridDividerH} />
                <EditPanel onSave={s.saveDate} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
                  <Text style={styles.editHint}>{t("settings.birthDateHint")}</Text>
                  <View style={styles.dateRow}>
                    <TextInput
                      style={[styles.textInput, styles.dateCell]}
                      value={s.dateBuffer.day}
                      onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, day: v })}
                      placeholder="DD"
                      placeholderTextColor={ChatColors.placeholder}
                      selectionColor={ChatColors.lunaraLabel}
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
                      placeholderTextColor={ChatColors.placeholder}
                      selectionColor={ChatColors.lunaraLabel}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                    />
                    <TextInput
                      style={[styles.textInput, styles.yearCell]}
                      value={s.dateBuffer.year}
                      onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, year: v })}
                      placeholder="YYYY"
                      placeholderTextColor={ChatColors.placeholder}
                      selectionColor={ChatColors.lunaraLabel}
                      keyboardType="number-pad"
                      maxLength={4}
                      textAlign="center"
                    />
                  </View>
                </EditPanel>
              </>
            )}

            <View style={styles.profileGridDividerH} />

            {/* 2-column grid for time + place */}
            <View style={styles.profileGrid}>
              <View style={styles.profileGridCell}>
                <ProfileRow
                  label={t("settings.birthTime")}
                  value={formatTime(s.user?.birth_hour ?? null, s.user?.birth_minute ?? null, notSet) !== notSet
                    ? formatTime(s.user?.birth_hour ?? null, s.user?.birth_minute ?? null, notSet)
                    : undefined}
                  onEdit={s.editingField === "time" ? undefined : () => s.startEditing("time")}
                  notSet={notSet}
                />
              </View>
              <View style={styles.profileGridDividerV} />
              <View style={styles.profileGridCell}>
                <ProfileRow
                  label={t("settings.birthPlace")}
                  value={s.user?.birth_place_name ?? undefined}
                  notSet={notSet}
                />
              </View>
            </View>

            {s.editingField === "time" && (
              <>
                <View style={styles.profileGridDividerH} />
                <EditPanel onSave={s.saveTime} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
                  <Text style={styles.editHint}>{t("settings.birthTimeHint")}</Text>
                  <View style={styles.dateRow}>
                    <TextInput
                      style={[styles.textInput, styles.dateCell]}
                      value={s.timeBuffer.hour}
                      onChangeText={(v) => s.setTimeBuffer({ ...s.timeBuffer, hour: v })}
                      placeholder="HH"
                      placeholderTextColor={ChatColors.placeholder}
                      selectionColor={ChatColors.lunaraLabel}
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
                      placeholderTextColor={ChatColors.placeholder}
                      selectionColor={ChatColors.lunaraLabel}
                      keyboardType="number-pad"
                      maxLength={2}
                      textAlign="center"
                    />
                  </View>
                </EditPanel>
              </>
            )}
          </Card>

          {/* ── Language ── */}
          <SectionTitle label={t("settings.language")} />
          <Card>
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
          </Card>

          {/* ── Data ── */}
          <SectionTitle label={t("settings.data")} />
          <Card>
            <CenteredRow
              label={`🗑️  ${t("settings.clearHistory")}`}
              subtitle={t("settings.clearHistoryDesc")}
              onPress={handleClearHistory}
              danger
            />
          </Card>

          {/* ── Support ── */}
          <SectionTitle label={t("settings.support")} />
          <Card>
            <CenteredRow
              label={`💬  ${t("settings.contactUs")}`}
              subtitle={t("settings.contactUsDesc")}
              onPress={handleContactUs}
            />
          </Card>
          <View style={styles.supportRow}>
            <Pressable
              style={({ pressed }) => [styles.supportCard, pressed && styles.rowPressed]}
              onPress={() => setLegalModal("terms")}
            >
              <Text style={styles.supportEmoji}>📄</Text>
              <Text style={styles.supportCardLabel}>{t("settings.termsOfService")}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.supportCard, pressed && styles.rowPressed]}
              onPress={() => setLegalModal("privacy")}
            >
              <Text style={styles.supportEmoji}>🔒</Text>
              <Text style={styles.supportCardLabel}>{t("settings.privacyPolicy")}</Text>
            </Pressable>
          </View>

          {/* ── About ── */}
          <SectionTitle label={t("settings.about")} />
          <Card>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutStar}>✦</Text>
              <Text style={styles.aboutApp}>LUNARA</Text>
              <Text style={styles.aboutTagline}>{t("settings.tagline")}</Text>
              <View style={styles.aboutRule} />
              <Text style={styles.aboutSub}>{t("settings.credit")}</Text>
            </View>
          </Card>

          <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Legal modals */}
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: ChatColors.lunaraLabel,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 10,
  },

  card: {
    backgroundColor: ChatColors.inputBarBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(100,80,40,0.22)",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: ChatColors.divider,
    marginLeft: 56,
  },

  // Support side-by-side cards
  supportRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  supportCard: {
    flex: 1,
    backgroundColor: ChatColors.inputBarBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(100,80,40,0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    paddingHorizontal: 8,
    gap: 8,
  },
  supportEmoji: {
    fontSize: 28,
  },
  supportCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: ChatColors.lunaraText,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Centered action row
  centeredRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  centeredRowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: ChatColors.lunaraText,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  centeredRowSubtitle: {
    fontSize: 12,
    color: "rgba(15,9,32,0.45)",
    textAlign: "center",
    marginTop: 3,
  },

  // Profile grid
  profileGrid: {
    flexDirection: "row",
  },
  profileGridCell: {
    flex: 1,
  },
  profileGridDividerV: {
    width: 1,
    backgroundColor: ChatColors.divider,
  },
  profileGridDividerH: {
    height: 1,
    backgroundColor: ChatColors.divider,
  },
  profileRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  profileLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: ChatColors.lunaraLabel,
    letterSpacing: 1.8,
    marginBottom: 6,
    opacity: 0.7,
  },
  profileValue: {
    fontSize: 15,
    fontWeight: "600",
    color: ChatColors.lunaraText,
    textAlign: "center",
  },
  profileValueUnset: {
    color: "rgba(15,9,32,0.3)",
    fontWeight: "400",
    fontStyle: "italic",
    fontSize: 13,
  },
  profilePencil: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: { backgroundColor: "rgba(100,80,40,0.08)" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: ChatColors.lunaraText,
    letterSpacing: 0.1,
  },
  infoValue: {
    fontSize: 13,
    color: "rgba(15,9,32,0.52)",
  },

  editPanel: {
    paddingHorizontal: 16,
    paddingBottom: 14,
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

  languageRow: { flexDirection: "row" },
  langButton: {
    flex: 1,
    paddingVertical: 14,
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
    color: "rgba(15,9,32,0.55)",
  },
  langButtonTextActive: {
    color: ChatColors.sendActive,
    fontWeight: "700",
  },

  aboutContent: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 6,
  },
  aboutStar: {
    fontSize: 26,
    color: ChatColors.lunaraLabel,
    marginBottom: 2,
  },
  aboutApp: {
    fontSize: 22,
    fontWeight: "700",
    color: ChatColors.lunaraLabel,
    letterSpacing: 5,
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

  // Legal modal
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
