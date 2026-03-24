import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IOSDatePicker from "../../../components/IOSDatePicker";
import { useTranslation } from "react-i18next";

interface TimePickerProps {
  hour: number;
  minute: number;
  onTimeChange: (updates: { hour?: number; minute?: number }) => void;
  onConfirm: () => void;
  /** Whether to show the confirm button (default true) */
  showConfirm?: boolean;
}

export default function TimePicker({
  hour,
  minute,
  onTimeChange,
  onConfirm,
  showConfirm = true,
}: TimePickerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const handleHourChange = (newHour: number) => {
    onTimeChange({ hour: newHour });
  };

  const handleMinuteChange = (newMinute: number) => {
    onTimeChange({ minute: newMinute });
  };

  const formatHour = (h: number) => {
    return h.toString().padStart(2, "0");
  };

  const formatMinute = (m: number) => {
    return m.toString().padStart(2, "0");
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("timePicker.title")}</Text>
      </View>

      <View style={styles.row}>
        <IOSDatePicker
          value={hour}
          onValueChange={handleHourChange}
          min={0}
          max={23}
          label={t("timePicker.hour")}
          formatter={formatHour}
        />

        <IOSDatePicker
          value={minute}
          onValueChange={handleMinuteChange}
          min={0}
          max={59}
          label={t("timePicker.minute")}
          formatter={formatMinute}
        />
      </View>

      {showConfirm !== false && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>{t("common.continue")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a0d2e",
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#d4af37",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    height: 250,
  },
  confirmButton: {
    backgroundColor: "#d4af37",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    color: "#1a0d2e",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
