import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function PolicyModal({ visible, onClose, title, content }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={s.header}>
            <Text style={s.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            <Text style={s.body}>{content}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6,4,18,0.85)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0f0b22",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "88%",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "#C9A84C33",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#E8C97A",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  close: {
    color: "#a09070",
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  body: {
    color: "#cbbfa0",
    fontSize: 13,
    lineHeight: 21,
  },
});
