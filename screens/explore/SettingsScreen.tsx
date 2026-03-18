import React from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../utils/theme";
import { useSettings } from "./hooks/useSettings";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(year: number | null, month: number | null, day: number | null): string {
  if (!year || !month || !day) return "Not set";
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function formatTime(hour: number | null, minute: number | null): string {
  if (hour == null || minute == null) return "Not set";
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

function InfoRow({
  icon,
  label,
  value,
  onEdit,
  accent,
  danger,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value?: string;
  onEdit?: () => void;
  accent?: string;
  danger?: boolean;
}) {
  const color = danger ? Colors.error : (accent ?? Colors.goldPrimary);
  return (
    <Pressable
      style={({ pressed }) => [styles.infoRow, pressed && onEdit ? styles.rowPressed : null]}
      onPress={onEdit}
      disabled={!onEdit}
    >
      <View style={[styles.iconBox, { backgroundColor: color + "18" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, danger && { color: Colors.error }]}>{label}</Text>
        {value ? <Text style={styles.infoValue} numberOfLines={1}>{value}</Text> : null}
      </View>
      {onEdit && (
        <MaterialCommunityIcons
          name={danger ? "chevron-right" : "pencil-outline"}
          size={16}
          color={danger ? Colors.error + "88" : Colors.textFaint}
        />
      )}
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
  return (
    <View style={styles.editPanel}>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.editActions}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={onSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={Colors.bgMain} />
            : <Text style={styles.saveBtnText}>Save</Text>}
        </Pressable>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const navigation = useNavigation();
  const s = useSettings();

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "This will permanently delete all your conversations. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await s.clearHistory();
            Alert.alert("Done", "All chat history cleared.");
          },
        },
      ]
    );
  };

  if (s.loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color={Colors.goldPrimary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgMain} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.goldPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Your Profile ── */}
        <SectionTitle label="Your Profile" />
        <Card>
          <InfoRow
            icon="account-outline"
            label="Name"
            value={s.user?.name ?? "Not set"}
            onEdit={s.editingField === "name" ? undefined : () => s.startEditing("name")}
          />
          {s.editingField === "name" && (
            <EditPanel onSave={s.saveName} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
              <TextInput
                style={styles.textInput}
                value={s.nameBuffer}
                onChangeText={s.setNameBuffer}
                placeholder="Your name"
                placeholderTextColor={Colors.textFaint}
                autoFocus
              />
            </EditPanel>
          )}

          <Divider />

          <InfoRow
            icon="cake-variant-outline"
            label="Birth Date"
            value={formatDate(s.user?.birth_year ?? null, s.user?.birth_month ?? null, s.user?.birth_day ?? null)}
            onEdit={s.editingField === "date" ? undefined : () => s.startEditing("date")}
            accent={Colors.pinkLight}
          />
          {s.editingField === "date" && (
            <EditPanel onSave={s.saveDate} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
              <Text style={styles.editHint}>Day · Month · Year</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.textInput, styles.dateCell]}
                  value={s.dateBuffer.day}
                  onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, day: v })}
                  placeholder="DD"
                  placeholderTextColor={Colors.textFaint}
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
                  placeholderTextColor={Colors.textFaint}
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                <TextInput
                  style={[styles.textInput, styles.yearCell]}
                  value={s.dateBuffer.year}
                  onChangeText={(v) => s.setDateBuffer({ ...s.dateBuffer, year: v })}
                  placeholder="YYYY"
                  placeholderTextColor={Colors.textFaint}
                  keyboardType="number-pad"
                  maxLength={4}
                  textAlign="center"
                />
              </View>
            </EditPanel>
          )}

          <Divider />

          <InfoRow
            icon="clock-outline"
            label="Birth Time"
            value={formatTime(s.user?.birth_hour ?? null, s.user?.birth_minute ?? null)}
            onEdit={s.editingField === "time" ? undefined : () => s.startEditing("time")}
            accent={Colors.skyBlue}
          />
          {s.editingField === "time" && (
            <EditPanel onSave={s.saveTime} onCancel={s.cancelEditing} saving={s.saving} error={s.error}>
              <Text style={styles.editHint}>24h format — Hour : Minute</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.textInput, styles.dateCell]}
                  value={s.timeBuffer.hour}
                  onChangeText={(v) => s.setTimeBuffer({ ...s.timeBuffer, hour: v })}
                  placeholder="HH"
                  placeholderTextColor={Colors.textFaint}
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
                  placeholderTextColor={Colors.textFaint}
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
              </View>
            </EditPanel>
          )}

          <Divider />

          <InfoRow
            icon="map-marker-outline"
            label="Birth Place"
            value={s.user?.birth_place_name ?? "Not set"}
            accent={Colors.goldLight}
          />
        </Card>

        {/* ── Data ── */}
        <SectionTitle label="Data" />
        <Card>
          <InfoRow
            icon="delete-outline"
            label="Clear Chat History"
            value="Delete all saved conversations"
            onEdit={handleClearHistory}
            danger
          />
        </Card>

        {/* ── About ── */}
        <SectionTitle label="About" />
        <Card>
          <View style={styles.aboutContent}>
            <MaterialCommunityIcons name="star-four-points" size={30} color={Colors.goldPrimary} />
            <Text style={styles.aboutApp}>LUNARA</Text>
            <Text style={styles.aboutTagline}>Your personal astrology companion</Text>
            <Text style={styles.aboutSub}>Powered by OpenAI  ·  Built with ✦</Text>
          </View>
        </Card>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSide: { width: 36 },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.goldPrimary,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textFaint,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 10,
    marginLeft: 4,
  },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGold,
    marginLeft: 62,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: { backgroundColor: "rgba(212,175,55,0.06)" },
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
    color: Colors.goldPale,
    letterSpacing: 0.1,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  editPanel: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  editHint: {
    fontSize: 11,
    color: Colors.textFaint,
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.white,
  },
  dateRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  dateCell: { flex: 1 },
  yearCell: { flex: 1.6 },
  timeSep: { fontSize: 22, color: Colors.goldPrimary, fontWeight: "200" },
  editActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, color: Colors.textMuted },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.goldPrimary,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: Colors.bgMain },
  errorText: { fontSize: 12, color: Colors.error },

  aboutContent: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 6,
  },
  aboutApp: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.goldPrimary,
    letterSpacing: 4,
    marginTop: 6,
  },
  aboutTagline: {
    fontSize: 14,
    color: Colors.goldPale,
    letterSpacing: 0.3,
  },
  aboutSub: {
    fontSize: 12,
    color: Colors.textFaint,
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
