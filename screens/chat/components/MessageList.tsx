import React, { useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import MessageBubble from "./MessageBubble";

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
};

export default function MessageList({ messages, scrollViewRef, onStreamingComplete }: MessageListProps) {
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
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingVertical: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {messages.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
          <Text 
            style={{ 
              color: "rgba(212, 175, 55, 0.6)", 
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
        messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            onStreamingComplete={onStreamingComplete}
          />
        ))
      )}
    </ScrollView>
  );
}
