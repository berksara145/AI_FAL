import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { SvgXml } from "react-native-svg";
import ViewShot, { captureRef } from "react-native-view-shot";

// Database
import {
  createChatSession,
  getChatSession,
  getMessagesBySession,
  addMessage,
} from "../../db/chat.repo";
import { updateBirthLocation, updateBirthTime } from "../../db/user.repo";
import { createPersonMinimal, MAX_PERSONS } from "../../db/person.repo";
import type { Message } from "../../types/message";
import type { ChatSession } from "../../types/chatSession";

// Natal Chart + Image
import {
  generateAndSaveNatalChart,
  formatChartDataForDisplay,
} from "../../lib/natalChartService";
import { saveChartPngFromCapture } from "../../lib/chartImageService";
import { getZodiacImageDataUris } from "../../lib/zodiacImageLoader";
import type { ChartStyleConfig, GeneratedChart } from "../../types/natalChart";

// Components
import ChatSessionCore, { type ChatMessage } from "../chat/components/ChatSessionCore";
import TimePicker from "./components/TimePicker";
import LocationSearch from "./components/LocationSearch";
import BirthDatePicker from "../onboarding/components/BirthDatePicker";
import type { BirthDateState } from "../onboarding/hooks/useOnboardingState";

type BirthMapRouteProp = RouteProp<RootStackParamList, "ChatSession">;
type BirthLocation = {
  placeName: string;
  placeId: string;
  lat: number;
  lng: number;
};

type AddPersonStep = "name" | "birthDate";

// Convert database Message to UI message format
const messageToUI = (msg: Message): ChatMessage => ({
  id: msg.id.toString(),
  role: msg.role === "system" ? "assistant" : msg.role, // Convert system to assistant for UI
  content: msg.content,
  timestamp: new Date(msg.timestamp),
});

export default function BirthMapChatWrapper({ personName: incomingPersonName, birthDate: incomingBirthDate }: { personName?: string; birthDate?: string } = {}) {
  const route = useRoute<BirthMapRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { sessionId } = route.params || {};
  const birthDate = incomingBirthDate ?? (route.params as any)?.birthDate;
  const personNameFromParams = incomingPersonName ?? (route.params as any)?.personName;
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId ? Number(sessionId) : null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add-person wizard: only name + birth date wheel, then create person and go back
  const [addPersonStep, setAddPersonStep] = useState<AddPersonStep>("name");
  const [collectedName, setCollectedName] = useState<string | null>(null);
  const [createdPersonName, setCreatedPersonName] = useState<string | null>(null);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const defaultYear = new Date().getFullYear() - 25;
  const [addPersonBirthDateState, setAddPersonBirthDateState] = useState<BirthDateState>({
    year: defaultYear,
    month: 1,
    day: 1,
  });
  const effectivePersonName = personNameFromParams ?? createdPersonName;

  // Birth map flow state (time, location, chart — only when opened from PersonDetail with personName)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [birthTime, setBirthTime] = useState({ hour: 12, minute: 0 });
  const [birthLocation, setBirthLocation] = useState<BirthLocation | undefined>(undefined);
  const [generatedChart, setGeneratedChart] = useState<GeneratedChart | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [pendingChartCapture, setPendingChartCapture] = useState<{ svgContent: string; personName: string } | null>(null);
  const chartCaptureRef = useRef<ViewShot>(null);
  const captureDoneRef = useRef(false);
  const lastChartRef = useRef<GeneratedChart | null>(null);
  const lastSessionIdRef = useRef<number | null>(null);

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

        // Create new session for birth map (different initial message for add-person vs existing person)
        const isAddPersonFlow = !personNameFromParams;
        const firstMessage = isAddPersonFlow
          ? "Let's add someone to your orbit. What's their name?"
          : "To generate your birth map, I'll need a few details. First, what time were you born? Please provide the hour and minute.";
        console.log("[BirthMapChatWrapper] Creating new birth map session...", { isAddPersonFlow });
        session = await createChatSession({
          mode: "interactive",
          feature: "birthMap",
          initialMessage: firstMessage,
        });

        setCurrentSessionId(session.id);
        setCurrentSession(session);
        console.log("[BirthMapChatWrapper] ✅ New session created with ID:", session.id);

        const dbMessage = await addMessage({
          sessionId: session.id,
          role: "assistant",
          content: firstMessage,
        });
        const initialMessage = messageToUI(dbMessage);
        initialMessage.isStreaming = true;
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

  const finishChartFlow = async () => {
    const sid = lastSessionIdRef.current;
    if (sid == null) return;
    const chartMessage = await addMessage({
      sessionId: sid,
      role: "assistant",
      content: "✨ Your Natal Chart has been generated and saved!",
    });
    setMessages((prev) => [...prev, messageToUI(chartMessage)]);
    try {
      navigation.goBack();
    } catch (e) {
      console.error("[BirthMapChatWrapper] goBack error:", e);
    }
  };

  // When we have pending capture: wait for ref, run view-shot, save PNG to cache + update person, then finish flow.
  useEffect(() => {
    if (!pendingChartCapture || captureDoneRef.current) return;
    const { svgContent, personName } = pendingChartCapture;
    let cancelled = false;
    const run = async () => {
      let attempts = 0;
      while (!chartCaptureRef.current && attempts < 50 && !cancelled) {
        await new Promise((r) => setTimeout(r, 50));
        attempts++;
      }
      if (cancelled || !chartCaptureRef.current) return;
      try {
        const uri = await captureRef(chartCaptureRef.current, { format: "png", result: "tmpfile" });
        if (cancelled) return;
        const pngPath = await saveChartPngFromCapture(uri, svgContent, personName);
        console.log("[BirthMapChatWrapper] ✅ Chart image saved, png_path:", pngPath);
      } catch (e) {
        console.error("[BirthMapChatWrapper] Chart capture/save error:", e);
      } finally {
        if (!cancelled) {
          captureDoneRef.current = true;
          setPendingChartCapture(null);
          await finishChartFlow();
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [pendingChartCapture]);

  const handleSendMessage = async (text: string) => {
    if (showTimePicker || showLocationSearch || showBirthDatePicker || !currentSessionId) return;

    const isAddPersonFlow = !personNameFromParams;

    try {
      // Add-person wizard: intercept name and birth date before normal flow
      if (isAddPersonFlow && addPersonStep === "name") {
        const name = text.trim();
        if (!name) return;
        const userDbMessage = await addMessage({
          sessionId: currentSessionId,
          role: "user",
          content: text,
        });
        setMessages((prev) => [...prev, messageToUI(userDbMessage)]);
        setCollectedName(name);
        setAddPersonStep("birthDate");
        const reply = await addMessage({
          sessionId: currentSessionId,
          role: "assistant",
          content: `Great! Select ${name}'s birth date below:`,
        });
        const replyMsg = messageToUI(reply);
        replyMsg.isStreaming = true;
        setMessages((prev) => [...prev, replyMsg]);
        // Birth date picker opens in handleStreamingComplete after this message finishes streaming
        return;
      }

      // birthDate step is handled by BirthDatePicker wheel (no text input)

      // Normal: just save user message
      const userDbMessage = await addMessage({
        sessionId: currentSessionId,
        role: "user",
        content: text,
      });
      setMessages((prev) => [...prev, messageToUI(userDbMessage)]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleBirthDateConfirm = async () => {
    if (!currentSessionId || !collectedName) return;
    const y = addPersonBirthDateState.year ?? new Date().getFullYear();
    const m = addPersonBirthDateState.month ?? 1;
    const d = addPersonBirthDateState.day ?? 1;
    setShowBirthDatePicker(false);
    try {
      await createPersonMinimal({ name: collectedName, birth_year: y, birth_month: m, birth_day: d });
    } catch (e: any) {
      if (e?.message === "PERSON_LIMIT_REACHED") {
        const reply = await addMessage({
          sessionId: currentSessionId,
          role: "assistant",
          content: `You've reached the maximum of ${MAX_PERSONS} people in your orbit. Remove someone to add a new person.`,
        });
        setMessages((prev) => [...prev, messageToUI(reply)]);
        return;
      }
      throw e;
    }
    setCreatedPersonName(collectedName);
    const reply = await addMessage({
      sessionId: currentSessionId,
      role: "assistant",
      content: `Added ${collectedName} to your orbit! ✨`,
    });
    setMessages((prev) => [...prev, messageToUI(reply)]);
    navigation.goBack();
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
    
      // Persist birth time to user or person record
    try {
      console.log("[BirthMapChatWrapper] 💾 Saving birth time to database...");
      await updateBirthTime(birthTime.hour, birthTime.minute, effectivePersonName ?? undefined);
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
    setMessages((prev) => {
      const updated = prev.map((msg) => {
        if (msg.id === messageId) {
          const content = msg.content.toLowerCase();
          // Add-person: open birth date picker only after "Select X's birth date below" finishes streaming
          if (addPersonStep === "birthDate" && content.includes("birth date") && content.includes("below")) {
            setTimeout(() => setShowBirthDatePicker(true), 100);
          }
          if (content.includes("what time were you born") || (content.includes("what time was ") && content.includes(" born"))) {
            setTimeout(() => setShowTimePicker(true), 100);
          }
          if (content.includes("location where you were born") || (content.includes("location where") && content.includes("born"))) {
            setTimeout(() => setShowLocationSearch(true), 100);
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

    // Persist birth location to user or person record
    try {
      console.log("[BirthMapChatWrapper] 💾 Saving birth location to database...");
      await updateBirthLocation(
        {
          placeName: birthLocation.placeName,
          placeId: birthLocation.placeId,
          lat: birthLocation.lat,
          lng: birthLocation.lng,
        },
        effectivePersonName ?? undefined
      );
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
    console.log("[BirthMapChatWrapper] currentSessionId:", currentSessionId, "effectivePersonName:", effectivePersonName);

    if (!currentSessionId) {
      console.error("[BirthMapChatWrapper] ❌ No currentSessionId, aborting");
      return;
    }
    if (!effectivePersonName) {
      console.error("[BirthMapChatWrapper] ❌ personName required for chart (use persons table)");
      try {
        const errMsg = await addMessage({
          sessionId: currentSessionId,
          role: "assistant",
          content: "Please tell me the person's name and birth date first, or open Birth Map from a person's profile.",
        });
        setMessages((prev) => [...prev, messageToUI(errMsg)]);
      } catch (e) {
        console.error("[BirthMapChatWrapper] Failed to add error message:", e);
      }
      return;
    }

    try {
      setIsGeneratingChart(true);
      console.log("[BirthMapChatWrapper] 🚀 isGeneratingChart set to true");

      // Load zodiac images as data URIs so they render inside SVG and in captured PNG
      const zodiacImageUrls = await getZodiacImageDataUris();

      const chartStyle: ChartStyleConfig = {
        size: 1000,
        backgroundColor: "#0a0015",
        starry: true,
        starCount: 400,
        primaryRingColor: "#d4af37",
        secondaryRingColor: "#8b6914",
        accentColor: "#ff1493",
        zodiacTextColor: "#ffd700",
        bodyIconSize: 28,
        zodiacImageUrls,
        useGradients: true,
        glowEffect: true,
      };
      console.log("[BirthMapChatWrapper] ✅ Chart style defined");

      // 1) Generate chart and save SVG to DB (png_path stays null for now)
      console.log("[BirthMapChatWrapper] 📊 Calling generateAndSaveNatalChart...", { personName: effectivePersonName });
      const chart = await generateAndSaveNatalChart(chartStyle, undefined, effectivePersonName);
      console.log("[BirthMapChatWrapper] ✅ Chart + SVG saved to DB");

      setGeneratedChart(chart);
      lastChartRef.current = chart;
      lastSessionIdRef.current = currentSessionId;
      const nameForPerson = effectivePersonName ?? chart.chartData.birthData.name ?? "";
      if (nameForPerson && chart.svgContent) {
        captureDoneRef.current = false;
        setPendingChartCapture({ svgContent: chart.svgContent, personName: nameForPerson });
      } else {
        await finishChartFlow();
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

  const CAPTURE_SIZE = 400;

  return (
    <>
    <ChatSessionCore
      title="Generate Birth Map"
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading || isGeneratingChart}
      mode="interactive"
      disabled={showTimePicker || showLocationSearch || showBirthDatePicker || isGeneratingChart}
      onClose={() => navigation.goBack()}
      onStreamingComplete={handleStreamingComplete}
    >
      {/* Add-person: birth date wheel (same as onboarding) */}
      {showBirthDatePicker && (
        <BirthDatePicker
          birthDateState={addPersonBirthDateState}
          onDateChange={(updates) =>
            setAddPersonBirthDateState((prev) => ({ ...prev, ...updates }))
          }
          onConfirm={handleBirthDateConfirm}
          title="Select their birth date"
        />
      )}

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

    {/* Hidden view to capture chart as PNG after SVG is saved to DB */}
    {pendingChartCapture && (
      <View style={[StyleSheet.absoluteFill, styles.hiddenCapture]} pointerEvents="none">
        <ViewShot
          ref={chartCaptureRef}
          options={{ format: "png", result: "tmpfile" }}
          style={{ width: CAPTURE_SIZE, height: CAPTURE_SIZE }}
        >
          <SvgXml xml={pendingChartCapture.svgContent} width={CAPTURE_SIZE} height={CAPTURE_SIZE} />
        </ViewShot>
      </View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  hiddenCapture: {
    opacity: 0,
    left: -9999,
    top: 0,
  },
});
