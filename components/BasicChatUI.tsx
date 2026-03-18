import React, { useState, useRef } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MessageList from "../screens/chat/components/MessageList";
import MessageInput from "../screens/chat/components/MessageInput";
import { ChatColors } from "../utils/theme";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date; // Optional timestamp
  isStreaming?: boolean; // Whether the message is currently streaming
};

type BasicChatUIProps = {
  title: string;
  initialMessage?: string; // Initial message from LUNARA (AI)
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
      return [
        {
          id: "1",
          role: "assistant",
          content: initialMessage,
        },
      ];
    }
    return [];
  });

  const scrollViewRef = useRef<ScrollView>(null);
  // Use external messages if provided, otherwise use internal state
  const messages = externalMessages !== undefined ? externalMessages : internalMessages;

  const handleSend = async (text: string) => {
    if (!text.trim() || disabled) return;

    // If using internal state, add user message immediately for better UX
    if (externalMessages === undefined) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text,
      };
      setInternalMessages((prev) => [...prev, userMessage]);
    }

    // Call the onSendMessage callback (parent should handle adding messages if using external state)
    await onSendMessage(text);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: ChatColors.bg }} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={ChatColors.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Title - Theatre Script Style */}
        <View 
          style={{ 
            paddingHorizontal: 24, 
            paddingTop: 0,
            paddingBottom: 10,
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

        {/* Chat Messages - Script Style */}
        <View className="flex-1" style={{ backgroundColor: ChatColors.bg }}>
          <MessageList 
            messages={messages} 
            scrollViewRef={scrollViewRef} 
            onStreamingComplete={onStreamingComplete}
          />
        </View>

        {/* Text Input - Minimal Theatre Style */}
        <View 
          style={{
            backgroundColor: ChatColors.bg,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 0 : 8),
          }}
        >
          <MessageInput onSend={handleSend} disabled={disabled} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
