import React, { useRef, useEffect } from "react";
import {
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput, { MessageInputHandle } from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { ChatColors } from "../../../utils/theme";
import { useTranslation } from "react-i18next";

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
  /** Rendered inside the scroll view, before all messages */
  headerContent?: React.ReactNode;
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
  headerContent,
  children,
}: ChatSessionCoreProps) {
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<MessageInputHandle>(null);
  const insets = useSafeAreaInsets();

  // Android: Animated.Value bypasses React re-render on each keyboard event,
  // updating the native layer directly — fixes the one-frame delay that caused
  // the input to not rise on the first tap.
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      keyboardPadding.setValue(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      keyboardPadding.setValue(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  const content = (
    <>
      <ChatHeader title={title} onClose={onClose || (() => {})} mode={mode} />

      <View style={{ flex: 1, backgroundColor: ChatColors.bg }}>
        {isLoading && messages.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: ChatColors.loadingText, fontSize: 14, fontStyle: "italic" }}>
              {t("chat.loading")}
            </Text>
          </View>
        ) : (
          <>
            <MessageList
              messages={messages}
              scrollViewRef={scrollViewRef}
              onStreamingComplete={onStreamingComplete || undefined}
              trailingContent={mode === "readonly" ? undefined : trailingContent}
              headerContent={headerContent}
              staticDisplay={mode === "readonly"}
            />
            {(isTyping || isLoading) && <TypingIndicator />}
          </>
        )}
      </View>

      {mode === "interactive" && (
        <MessageInput ref={inputRef} onSend={onSendMessage} disabled={disabled || isTyping} bottomInset={insets.bottom} />
      )}

      {mode !== "readonly" && children}
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ChatColors.headerBg }} edges={[]}>
      <StatusBar barStyle="light-content" backgroundColor={ChatColors.headerBg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        enabled={Platform.OS === "ios"}
      >
        <Animated.View style={{ flex: 1, paddingBottom: keyboardPadding }}>
          {content}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
