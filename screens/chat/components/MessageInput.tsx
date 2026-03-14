import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
    <View style={{ backgroundColor: "#1a0d2e", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Continue the dialogue..."
          placeholderTextColor="rgba(212, 175, 55, 0.5)"
          multiline
          maxLength={1000}
          editable={!disabled}
          keyboardAppearance="dark"
          style={{
            flex: 1,
            textAlignVertical: "top",
            backgroundColor: "#2d1b3d",
            borderWidth: 1,
            borderColor: "rgba(212, 175, 55, 0.3)",
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 44,
            maxHeight: 100,
            color: "#e5e5e5",
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
            borderColor: text.trim() && !disabled ? "#d4af37" : "rgba(212, 175, 55, 0.3)",
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
            color={text.trim() && !disabled ? "#d4af37" : "rgba(212, 175, 55, 0.4)"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
