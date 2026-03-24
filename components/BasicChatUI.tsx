import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StatusBar, Keyboard } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MessageList from "../screens/chat/components/MessageList";
import MessageInput from "../screens/chat/components/MessageInput";
import { ChatColors } from "../utils/theme";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
};

type BasicChatUIProps = {
  title: string;
  initialMessage?: string;
  onSendMessage: (text: string) => void | Promise<void>;
  messages?: ChatMessage[];
  disabled?: boolean;
  onStreamingComplete?: (messageId: string) => void;
};

export default function BasicChatUI({
  title,
  initialMessage,
  onSendMessage,
  messages: externalMessages,
  disabled = false,
  onStreamingComplete,
}: BasicChatUIProps) {
  const insets = useSafeAreaInsets();
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>(() => {
    if (initialMessage && !externalMessages) {
      return [{ id: "1", role: "assistant", content: initialMessage }];
    }
    return [];
  });
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const messages = externalMessages !== undefined ? externalMessages : internalMessages;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardPadding(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardPadding(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim() || disabled) return;
    if (externalMessages === undefined) {
      const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
      setInternalMessages((prev) => [...prev, userMessage]);
    }
    await onSendMessage(text);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: ChatColors.headerBg }} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={ChatColors.headerBg} />
      <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === "ios"} className="flex-1">
        <View style={{ flex: 1, paddingBottom: keyboardPadding }}>
          {/* Title */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 18,
              borderBottomWidth: 1,
              borderBottomColor: ChatColors.border,
              backgroundColor: ChatColors.headerBg,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "400",
                color: ChatColors.lunaraLabel,
                letterSpacing: 2,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {title}
            </Text>
          </View>

          {/* Chat Messages */}
          <View className="flex-1" style={{ backgroundColor: ChatColors.bg }}>
            <MessageList
              messages={messages}
              scrollViewRef={scrollViewRef}
              onStreamingComplete={onStreamingComplete}
            />
          </View>

          {/* Text Input */}
          <MessageInput onSend={handleSend} disabled={disabled} bottomInset={insets.bottom} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
