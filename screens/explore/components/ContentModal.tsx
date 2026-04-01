import React from "react";
import { View, Text, ScrollView, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { styles } from "../styles";

type ContentModalProps = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export function ContentModal({ visible, title, body, onClose }: ContentModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { paddingBottom: Math.max(36, insets.bottom + 16) }]}>
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

type AboutModalProps = {
  visible: boolean;
  onClose: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
};

export function AboutModal({ visible, onClose, onTerms, onPrivacy }: AboutModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { paddingBottom: Math.max(36, insets.bottom + 16) }]}>
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
