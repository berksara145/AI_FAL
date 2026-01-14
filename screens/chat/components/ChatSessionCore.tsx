import React, { useRef } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
};

type ChatSessionCoreProps = {
  title: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void | Promise<void>;
  isLoading?: boolean;
  isTyping?: boolean;
  disabled?: boolean;
  mode?: "interactive" | "readonly";
  onClose?: () => void;
  onStreamingComplete?: (messageId: string) => void;
  children?: React.ReactNode; // For additional UI like pickers, search bars, etc.
};

export default function ChatSessionCore({
  title,
  messages,
  onSendMessage,
  isLoading = false,
  isTyping = false,
  disabled = false,
  mode = "interactive",
  onClose,
  onStreamingComplete,
  children,
}: ChatSessionCoreProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#1a0d2e" }} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0d2e" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0}
      >
        <ChatHeader
          title={title}
          onClose={onClose || (() => {})}
          mode={mode}
        />

        <View className="flex-1" style={{ backgroundColor: "#1a0d2e" }}>
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "rgba(212, 175, 55, 0.6)", fontSize: 14 }}>
                Loading...
              </Text>
            </View>
          ) : (
            <>
              <MessageList
                messages={messages}
                scrollViewRef={scrollViewRef}
                onStreamingComplete={onStreamingComplete || undefined}
              />
              {isTyping && <TypingIndicator />}
            </>
          )}
        </View>

        {mode === "interactive" && (
          <MessageInput
            onSend={onSendMessage}
            disabled={disabled || isTyping}
          />
        )}

        {/* Additional UI components (pickers, search bars, etc.) */}
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
