import React, { useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import MessageBubble from "./MessageBubble";
import { ChatColors } from "../../../utils/theme";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
};

type MessageListProps = {
  messages: Message[];
  scrollViewRef?: React.RefObject<ScrollView | null>;
  onStreamingComplete?: (messageId: string) => void;
  trailingContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  staticDisplay?: boolean;
};

export default function MessageList({ messages, scrollViewRef, onStreamingComplete, trailingContent, headerContent, staticDisplay }: MessageListProps) {
  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef?.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, scrollViewRef]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ flex: 1, backgroundColor: ChatColors.bg }}
      contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 28, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {messages.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
          <Text 
            style={{ 
              color: ChatColors.loadingText,
              textAlign: "center",
              fontSize: 14,
              fontStyle: "italic",
              letterSpacing: 0.5,
            }}
          >
            The stage is set. Begin the dialogue...
          </Text>
        </View>
      ) : (
        <>
          {/* Date pill */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 30 }}>
            <Text style={{ fontSize: 8, color: ChatColors.sendActive, opacity: 0.55 }}>✦</Text>
            <Text style={{
              fontSize: 10,
              fontWeight: "600",
              letterSpacing: 2.2,
              textTransform: "uppercase",
              color: ChatColors.userLabel,
              opacity: 0.75,
            }}>
              {`Today · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
            </Text>
            <Text style={{ fontSize: 8, color: ChatColors.sendActive, opacity: 0.55 }}>✦</Text>
          </View>
          {headerContent}
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onStreamingComplete={onStreamingComplete}
              staticDisplay={staticDisplay}
              showDivider={index > 0}
            />
          ))}
          {trailingContent}
        </>
      )}
    </ScrollView>
  );
}
