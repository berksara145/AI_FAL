import React, { useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
} from "react-native";
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
  /** Rendered inside the scroll view, after the last message */
  trailingContent?: React.ReactNode;
  children?: React.ReactNode;
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
  trailingContent,
  children,
}: ChatSessionCoreProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const content = (
    <>
      <ChatHeader title={title} onClose={onClose || (() => {})} mode={mode} />

      <View style={{ flex: 1, backgroundColor: "#1a0d2e" }}>
        {isLoading && messages.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "rgba(212, 175, 55, 0.6)", fontSize: 14, fontStyle: "italic" }}>
              Loading...
            </Text>
          </View>
        ) : (
          <>
            <MessageList
              messages={messages}
              scrollViewRef={scrollViewRef}
              onStreamingComplete={onStreamingComplete || undefined}
              trailingContent={trailingContent}
            />
            {(isTyping || isLoading) && <TypingIndicator />}
          </>
        )}
      </View>

      {mode === "interactive" && (
        <SafeAreaView edges={["bottom"]}>
          <MessageInput onSend={onSendMessage} disabled={disabled || isTyping} />
        </SafeAreaView>
      )}

      {children}
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a0d2e" }} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0d2e" />

      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>{content}</View>
      )}
    </SafeAreaView>
  );
}
