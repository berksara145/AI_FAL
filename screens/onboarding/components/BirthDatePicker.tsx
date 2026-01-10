import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import IOSDatePicker from "../../../components/IOSDatePicker";
import { MONTH_NAMES_SHORT } from "../constants";
import { getMaxDays } from "../utils";
import type { BirthDateState } from "../hooks/useOnboardingState";

interface BirthDatePickerProps {
  birthDateState: BirthDateState;
  onDateChange: (updates: Partial<BirthDateState>) => void;
  onConfirm: () => void;
}

export default function BirthDatePicker({
  birthDateState,
  onDateChange,
  onConfirm,
}: BirthDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = birthDateState.month || 1;
  const currentYearValue = birthDateState.year || currentYear;

  const handleMonthChange = (month: number) => {
    const maxDay = getMaxDays(month, currentYearValue);
    onDateChange({
      month,
      day: birthDateState.day && birthDateState.day > maxDay ? maxDay : birthDateState.day,
    });
  };

  const handleDayChange = (day: number) => {
    onDateChange({ day });
  };

  const handleYearChange = (year: number) => {
    const maxDay = getMaxDays(currentMonth, year);
    onDateChange({
      year,
      day: birthDateState.day && birthDateState.day > maxDay ? maxDay : birthDateState.day,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Birth Date</Text>
      </View>

      <View style={styles.row}>
        <IOSDatePicker
          value={currentMonth}
          onValueChange={handleMonthChange}
          min={1}
          max={12}
          label="Month"
          formatter={(month) => MONTH_NAMES_SHORT[month - 1]}
        />

        <IOSDatePicker
          value={birthDateState.day || 1}
          onValueChange={handleDayChange}
          min={1}
          max={getMaxDays(currentMonth, currentYearValue)}
          label="Day"
        />

        <IOSDatePicker
          value={currentYearValue}
          onValueChange={handleYearChange}
          min={1900}
          max={currentYear}
          label="Year"
        />
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={onConfirm}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmButtonText}>Continue</Text>
      </TouchableOpacity>
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
