import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChatColors } from "../../../utils/theme";

type MessageInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <View style={{ backgroundColor: ChatColors.bg, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Continue the dialogue..."
          placeholderTextColor={ChatColors.placeholder}
          multiline
          maxLength={1000}
          editable={!disabled}
          keyboardAppearance="dark"
          style={{
            flex: 1,
            textAlignVertical: "top",
            backgroundColor: ChatColors.inputFieldBg,
            borderWidth: 1,
            borderColor: ChatColors.border,
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 44,
            maxHeight: 100,
            color: ChatColors.lunaraText,
            fontSize: 15,
            fontWeight: "300",
            letterSpacing: 0.3,
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          style={{
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: text.trim() && !disabled ? ChatColors.sendActive : ChatColors.sendInactive,
            borderRadius: 22,
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={text.trim() && !disabled ? ChatColors.sendActive : ChatColors.sendInactive}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
