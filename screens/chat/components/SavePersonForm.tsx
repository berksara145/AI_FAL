import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "../../../utils/theme";
import BirthDatePicker from "../../onboarding/components/BirthDatePicker";
import type { useSavePersonFlow } from "../hooks/useSavePersonFlow";

type SavePersonFlowReturn = ReturnType<typeof useSavePersonFlow>;

type Props = Pick<
  SavePersonFlowReturn,
  | "savePersonName"
  | "setSavePersonName"
  | "savePersonBirthDate"
  | "setSavePersonBirthDate"
  | "savePersonError"
  | "handleConfirm"
  | "handleCancel"
>;

export default function SavePersonForm({
  savePersonName,
  setSavePersonName,
  savePersonBirthDate,
  setSavePersonBirthDate,
  savePersonError,
  handleConfirm,
  handleCancel,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("chat.saveToChart")}</Text>
      <Text style={styles.subtitle}>{t("chat.saveToChartSubtitle")}</Text>
      <TextInput
        style={styles.nameInput}
        placeholder={t("chat.namePlaceholder")}
        placeholderTextColor={Colors.textFaint}
        value={savePersonName}
        onChangeText={setSavePersonName}
      />
      {savePersonError != null && (
        <Text style={styles.errorText}>{savePersonError}</Text>
      )}
      <BirthDatePicker
        birthDateState={savePersonBirthDate}
        onDateChange={(updates) =>
          setSavePersonBirthDate((prev) => ({ ...prev, ...updates }))
        }
        onConfirm={handleConfirm}
        title={t("onboarding.selectTheirBirthDate")}
      />
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
        <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgMain,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGold,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.goldPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginBottom: 12,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
});
