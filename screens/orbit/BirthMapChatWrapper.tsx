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
import ChatSessionCore, { type ChatMessage } from "../chat/components/ChatSessionCore";
import TimePicker from "./components/TimePicker";
import LocationSearch from "./components/LocationSearch";

type BirthMapRouteProp = RouteProp<RootStackParamList, "ChatSession">;
type BirthLocation = {
  placeName: string;
  placeId: string;
  lat: number;
  lng: number;
};

// Convert database Message to UI message format
const messageToUI = (msg: Message): ChatMessage => ({
  id: msg.id.toString(),
  role: msg.role === "system" ? "assistant" : msg.role, // Convert system to assistant for UI
  content: msg.content,
  timestamp: new Date(msg.timestamp),
});

export default function BirthMapChatWrapper() {
  const route = useRoute<BirthMapRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { sessionId, birthDate } = route.params || {};
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId ? Number(sessionId) : null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Birth map flow state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [birthTime, setBirthTime] = useState({ hour: 12, minute: 0 });
  const [birthLocation, setBirthLocation] = useState<BirthLocation | undefined>(undefined);

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

        // Create new session for birth map
        session = await createChatSession({
          mode: "interactive",
          feature: "birthMap",
          initialMessage: "To generate your birth map, I'll need a few details. First, what time were you born? Please provide the hour and minute.",
        });

        setCurrentSessionId(session.id);
        setCurrentSession(session);

        // Add initial message with streaming flag
        const firstMessage = "To generate your birth map, I'll need a few details. First, what time were you born? Please provide the hour and minute.";
        const dbMessage = await addMessage({
          sessionId: session.id,
          role: "assistant",
          content: firstMessage,
        });
        const initialMessage = messageToUI(dbMessage);
        initialMessage.isStreaming = true; // Mark as streaming
        setMessages([initialMessage]);
      } catch (error) {
        console.error("Error initializing birth map session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []); // Only run on mount

  const handleSendMessage = async (text: string) => {
    // Don't allow sending messages when pickers are shown
    if (showTimePicker || showLocationSearch || !currentSessionId) {
      return;
    }

    try {
      // Save user message to database
      const userDbMessage = await addMessage({
        sessionId: currentSessionId,
        role: "user",
        content: text,
      });

      const userMessage = messageToUI(userDbMessage);
      setMessages((prev) => [...prev, userMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTimeConfirm = async () => {
    if (!currentSessionId) return;
    
    setShowTimePicker(false);
    
    const timeString = `${birthTime.hour.toString().padStart(2, "0")}:${birthTime.minute.toString().padStart(2, "0")}`;
    
    // Save time confirmation as user message
    const timeMessage = await addMessage({
      sessionId: currentSessionId,
      role: "user",
      content: timeString,
    });
    setMessages((prev) => [...prev, messageToUI(timeMessage)]);
    
    // Add AI response asking for location with streaming flag
    const response = `Thank you! You were born at ${timeString}. Now, please enter the location where you were born.`;
    const aiDbMessage = await addMessage({
      sessionId: currentSessionId,
      role: "assistant",
      content: response,
    });
    const locationMessage = messageToUI(aiDbMessage);
    locationMessage.isStreaming = true; // Mark as streaming
    setMessages((prev) => [...prev, locationMessage]);
  };

  const handleStreamingComplete = (messageId: string) => {
    // Mark message as done streaming and check content
    setMessages((prev) => {
      const updated = prev.map((msg) => {
        if (msg.id === messageId) {
          // Check content before updating
          const content = msg.content;
          
          // If it's the initial message asking for time, show time picker
          if (content.includes("what time were you born")) {
            setTimeout(() => {
              setShowTimePicker(true);
            }, 300);
          }
          
          // If it's the message asking for location, show location search
          if (content.includes("location where you were born")) {
            setTimeout(() => {
              setShowLocationSearch(true);
            }, 300);
          }
          
          return { ...msg, isStreaming: false };
        }
        return msg;
      });
      return updated;
    });
  };

  const handleLocationConfirm = async () => {
    if (!currentSessionId || !birthLocation) return;

    setShowLocationSearch(false);

    // Save only the place name as user message
    const locationMessage = await addMessage({
      sessionId: currentSessionId,
      role: "user",
      content: birthLocation.placeName,
    });
    setMessages((prev) => [...prev, messageToUI(locationMessage)]);

    // Minimal AI confirmation (no details repeated)
    const response = "Yes, got it. Generating your birth map now...";
    const aiDbMessage = await addMessage({
      sessionId: currentSessionId,
      role: "assistant",
      content: response,
    });
    setMessages((prev) => [...prev, messageToUI(aiDbMessage)]);

    // TODO: Actually generate the birth map here
  };

  return (
    <ChatSessionCore
      title="Generate Birth Map"
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      mode="interactive"
      disabled={showTimePicker || showLocationSearch}
      onClose={() => navigation.goBack()}
      onStreamingComplete={handleStreamingComplete}
    >
      {/* Birth Map Time Picker */}
      {showTimePicker && (
        <TimePicker
          hour={birthTime.hour}
          minute={birthTime.minute}
          onTimeChange={(updates) =>
            setBirthTime((prev) => ({ ...prev, ...updates }))
          }
          onConfirm={handleTimeConfirm}
        />
      )}

      {/* Birth Map Location Search */}
      {showLocationSearch && (
        <LocationSearch
          onLocationSelect={(location) => setBirthLocation(location)}
          onConfirm={handleLocationConfirm}
        />
      )}
    </ChatSessionCore>
  );
}
