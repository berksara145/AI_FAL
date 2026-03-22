import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChatColors } from "../../../utils/theme";
import { useTranslation } from "react-i18next";

type MessageInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  const active = !!text.trim() && !disabled;

  return (
    <View style={{
      backgroundColor: ChatColors.inputBarBg,
      borderTopWidth: 1,
      borderTopColor: "rgba(100,80,40,0.15)",
      paddingHorizontal: 16,
      paddingTop: 13,
      paddingBottom: 26,
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      shadowColor: "#0c0818",
      shadowOpacity: 0.10,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: -8 },
      elevation: 6,
    }}>
      {/* Pill input */}
      <View style={{
        flex: 1,
        backgroundColor: ChatColors.inputFieldBg,
        borderWidth: 1.5,
        borderColor: "rgba(100,80,40,0.20)",
        borderRadius: 28,
        paddingHorizontal: 20,
        paddingVertical: 12,
        minHeight: 46,
        maxHeight: 110,
        justifyContent: "center",
      }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t("chat.inputPlaceholder")}
          placeholderTextColor={ChatColors.placeholder}
          multiline
          maxLength={1000}
          editable={!disabled}
          keyboardAppearance="light"
          style={{
            flex: 1,
            textAlignVertical: "top",
            fontSize: 14.5,
            fontWeight: "400",
            color: ChatColors.lunaraText,
            letterSpacing: 0.1,
            padding: 0,
          }}
        />
      </View>

      {/* Gold circle send button */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={!active}
        activeOpacity={0.75}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: ChatColors.sendActive,
          opacity: active ? 1 : 0.32,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          shadowColor: "#c9a84c",
          shadowOpacity: 0.45,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <MaterialCommunityIcons
          name="send"
          size={19}
          color={ChatColors.headerBg}
        />
      </TouchableOpacity>
    </View>
  );
}
