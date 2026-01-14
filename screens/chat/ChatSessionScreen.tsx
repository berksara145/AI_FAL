import React, { useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";

// Database
import {
  createChatSession,
  getChatSession,
  getMessagesBySession,
  addMessage,
} from "../../db/chat.repo";
import type { Message } from "../../types/message";
import type { ChatSession } from "../../types/chatSession";

// Components
import ChatSessionCore, { type ChatMessage } from "./components/ChatSessionCore";
import BirthMapChatWrapper from "../../screens/orbit/BirthMapChatWrapper";

type ChatSessionRouteProp = RouteProp<RootStackParamList, "ChatSession">;

// Convert database Message to UI message format
const messageToUI = (msg: Message): ChatMessage => ({
  id: msg.id.toString(),
  role: msg.role === "system" ? "assistant" : msg.role, // Convert system to assistant for UI
  content: msg.content,
  timestamp: new Date(msg.timestamp),
});

export default function ChatSessionScreen() {
  const route = useRoute<ChatSessionRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { sessionId, mode = "interactive", feature, initialMessage } = route.params || {};
  
  // If feature is birthMap, use the specialized wrapper
  if (feature === "birthMap") {
    return <BirthMapChatWrapper />;
  }
  
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId ? Number(sessionId) : null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
    <ChatSessionCore
      title={currentSession?.title || feature || currentSession?.feature || "Chat"}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      isTyping={isTyping}
      mode={mode}
      onClose={() => navigation.goBack()}
    />
  );
}
