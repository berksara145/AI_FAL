import React, { useState, useEffect, useRef } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import TypingIndicator from "./components/TypingIndicator";

type ChatSessionRouteProp = RouteProp<RootStackParamList, "ChatSession">;

export default function ChatSessionScreen() {
  const route = useRoute<ChatSessionRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);

  const { sessionId, personId, mode = "interactive", feature } = route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages on mount
  useEffect(() => {
    // TODO: Load messages from database using sessionId
    // For now, initialize with empty or welcome message
    if (messages.length === 0 && feature) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Welcome! Let's explore ${feature} together.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [sessionId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // TODO: Send message to AI and get response
    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "This is a placeholder response. AI integration coming soon!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ChatHeader
          title={feature || "Chat"}
          onClose={() => navigation.goBack()}
          mode={mode}
        />

        <View className="flex-1">
          <MessageList
            messages={messages}
            scrollViewRef={scrollViewRef}
          />
          {isTyping && <TypingIndicator />}
        </View>

        {mode === "interactive" && (
          <MessageInput
            onSend={handleSendMessage}
            disabled={isTyping}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
