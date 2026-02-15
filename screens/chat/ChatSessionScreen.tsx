import React, { useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";

const apiKey = "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";
          

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
import { sendChatToOpenAI, type ChatMsg } from "../../lib/gptClient";

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

  const { sessionId, mode = "interactive", feature, initialMessage, agenda } = route.params || {};
  
  // If feature is birthMap, use the specialized wrapper and pass route params explicitly
  if (feature === "birthMap") {
    return (
      <BirthMapChatWrapper
        personName={(route.params as any)?.personName}
        birthDate={(route.params as any)?.birthDate}
      />
    );
  }
  
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId ? Number(sessionId) : null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  /** Agenda from ExploreScreen: system prompt for this conversation class (used when calling GPT) */
  const [sessionAgenda] = useState<string | undefined>(agenda);

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

      (async () => {
        try {
          const buildMessages = (): ChatMsg[] => {
            const system = sessionAgenda || "You are a warm, supportive assistant. Keep responses concise and helpful.";
            const history: ChatMsg[] = messages
              .filter((m) => m.role === "user" || m.role === "assistant")
              .slice(-12)
              .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
            return [{ role: "system", content: system }, ...history, { role: "user", content: text.trim() }];
          };
          const aiResponse = await sendChatToOpenAI(buildMessages(), apiKey);

          const aiDbMessage = await addMessage({
            sessionId: currentSessionId,
            role: "assistant",
            content: aiResponse,
          });
          setMessages((prev) => [...prev, messageToUI(aiDbMessage)]);
        } catch (error) {
          console.error("Error calling AI or saving message:", error);
          const fallback = await addMessage({
            sessionId: currentSessionId,
            role: "assistant",
            content: "I couldn't reach the AI right now. Please try again or check your connection.",
          });
          setMessages((prev) => [...prev, messageToUI(fallback)]);
        } finally {
          setIsTyping(false);
        }
      })();
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
