import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { styles, C } from "../styles";

type Props = {
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
};

export default function EditPanel({ children, onSave, onCancel, saving, error }: Props) {
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
