import React, { useState, useEffect, useRef } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Database
import {
  createChatSession,
  getChatSession,
  getMessagesBySession,
  addMessage,
  updateChatSessionTimestamp,
} from "../../db/chat.repo";
import type { Message } from "../../types/message";
import type { ChatSession } from "../../types/chatSession";

// Components
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import TypingIndicator from "./components/TypingIndicator";

type ChatSessionRouteProp = RouteProp<RootStackParamList, "ChatSession">;

// Convert database Message to UI message format
const messageToUI = (msg: Message) => ({
  id: msg.id.toString(),
  role: msg.role,
  content: msg.content,
  timestamp: new Date(msg.timestamp),
});

export default function ChatSessionScreen() {
  const route = useRoute<ChatSessionRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const { sessionId, mode = "interactive", feature, initialMessage } = route.params || {};
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId ? Number(sessionId) : null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session and load messages
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);

        let session: ChatSession | null = null;

        // If sessionId provided, try to load existing session
        if (currentSessionId) {
          session = await getChatSession(currentSessionId);
          if (session) {
            setCurrentSession(session);
            // Load existing messages
            const dbMessages = await getMessagesBySession(currentSessionId);
            setMessages(dbMessages.map(messageToUI));
            setIsLoading(false);
            return;
          }
        }

        // Create new session if none exists
        // Note: personId is not needed since this is a local single-user database
        session = await createChatSession({
          mode,
          feature: feature || undefined,
          initialMessage: initialMessage || undefined,
        });

        setCurrentSessionId(session.id);
        setCurrentSession(session);

        // Add initial message if provided
        if (initialMessage || feature) {
          const firstMessage = initialMessage || (feature ? `Welcome! Let's explore ${feature} together.` : "Hello! How can I help you today?");
          const dbMessage = await addMessage({
            sessionId: session.id,
            role: "assistant",
            content: firstMessage,
          });
          setMessages([messageToUI(dbMessage)]);
        } else {
          // Default welcome message
          const defaultMessage = "Hello! How can I help you today?";
          const dbMessage = await addMessage({
            sessionId: session.id,
            role: "assistant",
            content: defaultMessage,
          });
          setMessages([messageToUI(dbMessage)]);
        }
      } catch (error) {
        console.error("Error initializing chat session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []); // Only run on mount

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentSessionId) return;

    try {
      // Save user message to database
      const userDbMessage = await addMessage({
        sessionId: currentSessionId,
        role: "user",
        content: text,
      });

      const userMessage = messageToUI(userDbMessage);
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // TODO: Send message to AI and get response
      // Simulate AI response
      setTimeout(async () => {
        try {
          const aiResponse = "This is a placeholder response. AI integration coming soon!";
          
          // Save AI response to database
          const aiDbMessage = await addMessage({
            sessionId: currentSessionId,
            role: "assistant",
            content: aiResponse,
          });

          const aiMessage = messageToUI(aiDbMessage);
          setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
          console.error("Error saving AI message:", error);
        } finally {
          setIsTyping(false);
        }
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#1a0d2e" }} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0d2e" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0}
      >
        <ChatHeader
          title={currentSession?.title || feature || currentSession?.feature || "Chat"}
          onClose={() => navigation.goBack()}
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
              />
              {isTyping && <TypingIndicator />}
            </>
          )}
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
