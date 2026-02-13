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
import { updateBirthLocation, updateBirthTime } from "../../db/user.repo";
import type { Message } from "../../types/message";
import type { ChatSession } from "../../types/chatSession";

// Natal Chart Service
import {
  generateAndSaveNatalChart,
  formatChartDataForDisplay,
} from "../../lib/natalChartService";
import type { ChartStyleConfig, GeneratedChart } from "../../types/natalChart";

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
  const [generatedChart, setGeneratedChart] = useState<GeneratedChart | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);

  // Initialize session and load messages
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log("[BirthMapChatWrapper] 🔌 Initializing session...");
        console.log("[BirthMapChatWrapper] Route params - sessionId:", sessionId, "birthDate:", birthDate);
        
        setIsLoading(true);

        let session: ChatSession | null = null;

        // If sessionId provided, try to load existing session
        if (currentSessionId) {
          console.log("[BirthMapChatWrapper] Loading existing session:", currentSessionId);
          session = await getChatSession(currentSessionId);
          if (session) {
            setCurrentSession(session);
            // Load existing messages
            const dbMessages = await getMessagesBySession(currentSessionId);
            setMessages(dbMessages.map(messageToUI));
            console.log("[BirthMapChatWrapper] ✅ Existing session loaded with", dbMessages.length, "messages");
            setIsLoading(false);
            return;
          }
        }

        // Create new session for birth map
        console.log("[BirthMapChatWrapper] Creating new birth map session...");
        session = await createChatSession({
          mode: "interactive",
          feature: "birthMap",
          initialMessage: "To generate your birth map, I'll need a few details. First, what time were you born? Please provide the hour and minute.",
        });

        setCurrentSessionId(session.id);
        setCurrentSession(session);
        console.log("[BirthMapChatWrapper] ✅ New session created with ID:", session.id);

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
        console.log("[BirthMapChatWrapper] ✅ Initial message added");
      } catch (error) {
        console.error("[BirthMapChatWrapper] ❌ Error initializing birth map session:", error);
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
    console.log("[BirthMapChatWrapper] handleTimeConfirm called");
    console.log("[BirthMapChatWrapper] birthTime:", birthTime);
    
    if (!currentSessionId) {
      console.error("[BirthMapChatWrapper] ❌ No currentSessionId, aborting");
      return;
    }
    
    setShowTimePicker(false);
    console.log("[BirthMapChatWrapper] ✅ Time picker modal closed");
    
    const timeString = `${birthTime.hour.toString().padStart(2, "0")}:${birthTime.minute.toString().padStart(2, "0")}`;
    console.log("[BirthMapChatWrapper] Formatted time string:", timeString);
    
    // Persist birth time to user record
    try {
      console.log("[BirthMapChatWrapper] 💾 Saving birth time to database...");
      await updateBirthTime(birthTime.hour, birthTime.minute);
      console.log("[BirthMapChatWrapper] ✅ Birth time saved successfully");
    } catch (error) {
      console.error("[BirthMapChatWrapper] ❌ Error saving birth time:", error);
    }
    
    // Save time confirmation as user message
    try {
      console.log("[BirthMapChatWrapper] 💬 Adding time message to chat...");
      const timeMessage = await addMessage({
        sessionId: currentSessionId,
        role: "user",
        content: timeString,
      });
      setMessages((prev) => [...prev, messageToUI(timeMessage)]);
      console.log("[BirthMapChatWrapper] ✅ Time message added");
    } catch (error) {
      console.error("[BirthMapChatWrapper] ❌ Error adding time message:", error);
    }
    
    // Add AI response asking for location with streaming flag
    try {
      console.log("[BirthMapChatWrapper] 💬 Adding location prompt message...");
      const response = `Thank you! You were born at ${timeString}. Now, please enter the location where you were born.`;
      const aiDbMessage = await addMessage({
        sessionId: currentSessionId,
        role: "assistant",
        content: response,
      });
      const locationMessage = messageToUI(aiDbMessage);
      locationMessage.isStreaming = true; // Mark as streaming
      setMessages((prev) => [...prev, locationMessage]);
      console.log("[BirthMapChatWrapper] ✅ Location prompt added");
    } catch (error) {
      console.error("[BirthMapChatWrapper] ❌ Error adding location prompt:", error);
    }
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
    console.log("[BirthMapChatWrapper] handleLocationConfirm called");
    console.log("[BirthMapChatWrapper] currentSessionId:", currentSessionId);
    console.log("[BirthMapChatWrapper] birthLocation:", birthLocation);
    
    if (!currentSessionId || !birthLocation) {
      console.error("[BirthMapChatWrapper] ❌ Missing sessionId or location, aborting");
      return;
    }

    setShowLocationSearch(false);
    console.log("[BirthMapChatWrapper] ✅ Location search modal closed");

    // Persist birth location to user record
    try {
      console.log("[BirthMapChatWrapper] 💾 Saving birth location to database...");
      await updateBirthLocation({
        placeName: birthLocation.placeName,
        placeId: birthLocation.placeId,
        lat: birthLocation.lat,
        lng: birthLocation.lng,
      });
      console.log("[BirthMapChatWrapper] ✅ Birth location saved successfully");
    } catch (error) {
      console.error("[BirthMapChatWrapper] ❌ Error saving birth location:", error);
    }

    // Save only the place name as user message
    try {
      console.log("[BirthMapChatWrapper] 💬 Adding location message to chat...");
      const locationMessage = await addMessage({
        sessionId: currentSessionId,
        role: "user",
        content: birthLocation.placeName,
      });
      setMessages((prev) => [...prev, messageToUI(locationMessage)]);
      console.log("[BirthMapChatWrapper] ✅ Location message added");
    } catch (error) {
      console.error("[BirthMapChatWrapper] ❌ Error adding location message:", error);
    }

    // Generate natal chart
    console.log("[BirthMapChatWrapper] 🎯 Calling generateNatalChart()...");
    await generateNatalChart();
    console.log("[BirthMapChatWrapper] ✅ generateNatalChart() completed");
  };

  const generateNatalChart = async () => {
    console.log("[BirthMapChatWrapper] 🔴 generateNatalChart called");
    console.log("[BirthMapChatWrapper] currentSessionId:", currentSessionId);
    
    if (!currentSessionId) {
      console.error("[BirthMapChatWrapper] ❌ No currentSessionId, aborting");
      return;
    }

    try {
      setIsGeneratingChart(true);
      console.log("[BirthMapChatWrapper] 🚀 isGeneratingChart set to true");

      // Define custom chart style
      const chartStyle: ChartStyleConfig = {
        size: 1000,
        backgroundColor: "#0a0015",
        starry: true,
        starCount: 400,
        primaryRingColor: "#d4af37",
        secondaryRingColor: "#8b6914",
        accentColor: "#ff1493",
        zodiacTextColor: "#ffd700",
        bodyIconSize: 20,
        useGradients: true,
        glowEffect: true,
      };
      console.log("[BirthMapChatWrapper] ✅ Chart style defined");

      // Generate and save the chart with filename "user_chart.svg"
      console.log("[BirthMapChatWrapper] 📊 Calling generateAndSaveNatalChart...");
      const chart = await generateAndSaveNatalChart(chartStyle, "user_chart.svg");
      console.log("[BirthMapChatWrapper] ✅ generateAndSaveNatalChart returned successfully");
      console.log("[BirthMapChatWrapper] Chart path:", chart.filePath);
      
      setGeneratedChart(chart);
      console.log("[BirthMapChatWrapper] ✅ Chart stored in state");

      // Format display data
      console.log("[BirthMapChatWrapper] 📝 Formatting chart data for display...");
      const { summary, details } = formatChartDataForDisplay(chart);
      console.log("[BirthMapChatWrapper] ✅ Chart data formatted");

      // Save chart generation message
      console.log("[BirthMapChatWrapper] 💬 Adding message to chat...");
      const chartMessage = await addMessage({
        sessionId: currentSessionId,
        role: "assistant",
        content: `✨ Your Natal Chart has been generated and saved!`,
      });
      console.log("[BirthMapChatWrapper] ✅ Message added to database");

      setMessages((prev) => [...prev, messageToUI(chartMessage)]);
      console.log("[BirthMapChatWrapper] ✅ Message displayed in chat");

      console.log("[BirthMapChatWrapper] 🎉 COMPLETE - Natal chart generated and saved!");

      // After successful generation, simply go back to the previous screen
      try {
        navigation.goBack();
        console.log("[BirthMapChatWrapper] ✅ goBack() called after chart generation");
      } catch (navErr) {
        console.error("[BirthMapChatWrapper] ❌ Failed to go back after chart generation:", navErr);
      }
    } catch (error) {
      console.error("[BirthMapChatWrapper] ❌ CRITICAL ERROR:", error);
      console.error("[BirthMapChatWrapper] Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("[BirthMapChatWrapper] Error message:", error instanceof Error ? error.message : String(error));
      console.error("[BirthMapChatWrapper] Full error:", error);

      // Send error message
      console.log("[BirthMapChatWrapper] Sending error message to user...");
      try {
        const errorMessage = await addMessage({
          sessionId: currentSessionId,
          role: "assistant",
          content:
            "I encountered an error generating your natal chart. Please ensure all information (birth date, time, and location) is complete.",
        });

        setMessages((prev) => [...prev, messageToUI(errorMessage)]);
        console.log("[BirthMapChatWrapper] ✅ Error message sent to user");
      } catch (msgError) {
        console.error("[BirthMapChatWrapper] Failed to send error message:", msgError);
      }
    } finally {
      setIsGeneratingChart(false);
      console.log("[BirthMapChatWrapper] ✅ isGeneratingChart set to false");
    }
  };

  return (
    <ChatSessionCore
      title="Generate Birth Map"
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading || isGeneratingChart}
      mode="interactive"
      disabled={showTimePicker || showLocationSearch || isGeneratingChart}
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
