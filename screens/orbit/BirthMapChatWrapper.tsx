import React from "react";
import { View, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import ViewShot from "react-native-view-shot";
import NatalChartView from "./components/NatalChartView";

// Hooks
import { useChatSession } from "./hooks/useChatSession";
import { useAddPersonFlow } from "./hooks/useAddPersonFlow";
import { useBirthMapFlow } from "./hooks/useBirthMapFlow";
import { useChartCapture } from "./hooks/useChartCapture";

// Components
import ChatSessionCore from "../chat/components/ChatSessionCore";
import TimePicker from "./components/TimePicker";
import LocationSearch from "./components/LocationSearch";
import BirthDatePicker from "../onboarding/components/BirthDatePicker";

type BirthMapRouteProp = RouteProp<RootStackParamList, "ChatSession">;

const CAPTURE_SIZE = 400;

export default function BirthMapChatWrapper(
  { personName: incomingPersonName, birthDate: incomingBirthDate }:
  { personName?: string; birthDate?: string } = {}
) {
  const route = useRoute<BirthMapRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const personNameFromParams = incomingPersonName ?? (route.params as any)?.personName;
  const sessionIdParam = (route.params as any)?.sessionId;
  const isAddPersonFlow = !personNameFromParams;

  // --- Hooks ---
  const chat = useChatSession({
    sessionId: sessionIdParam ? Number(sessionIdParam) : undefined,
    isAddPersonFlow,
    personName: personNameFromParams,
  });

  const addPerson = useAddPersonFlow(
    chat.appendMessage,
    () => navigation.goBack()
  );

  const effectivePersonName = personNameFromParams ?? addPerson.createdPersonName;

  const chartCapture = useChartCapture(async () => {
    await chat.appendMessage("assistant", "✨ Your Natal Chart has been generated and saved!");
    navigation.goBack();
  });

  const birthMap = useBirthMapFlow(
    effectivePersonName,
    chat.appendMessage,
    (chart) => {
      const name = effectivePersonName ?? chart.chartData.birthData.name ?? "";
      if (name && chart.svgContent) {
        chartCapture.startCapture(chart.svgContent, name, chart.chartData);
      } else {
        navigation.goBack();
      }
    },
    () => navigation.goBack()
  );

  // --- Streaming complete: trigger pickers based on message content ---
  const handleStreamingComplete = (messageId: string) => {
    chat.setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const content = msg.content.toLowerCase();

        if (isAddPersonFlow && addPerson.step === "birthDate" && content.includes("birth date") && content.includes("below")) {
          setTimeout(() => addPerson.openBirthDatePicker(), 100);
        }

        birthMap.handleStreamingComplete(messageId, msg.content);

        return { ...msg, isStreaming: false };
      })
    );
  };

  // --- Send message: route to correct handler ---
  const handleSendMessage = async (text: string) => {
    const isBlocked =
      birthMap.showTimePicker ||
      birthMap.showLocationSearch ||
      addPerson.showBirthDatePicker ||
      !chat.currentSessionId;

    if (isBlocked) return;

    if (isAddPersonFlow && addPerson.step === "name") {
      await addPerson.handleNameMessage(text);
    }
    // birthDate step handled by picker, not text input
  };

  const isDisabled =
    birthMap.showTimePicker ||
    birthMap.showLocationSearch ||
    addPerson.showBirthDatePicker ||
    birthMap.isGenerating;

  return (
    <>
      <ChatSessionCore
        title="Generate Birth Map"
        messages={chat.messages}
        onSendMessage={handleSendMessage}
        isLoading={chat.isLoading || birthMap.isGenerating}
        mode="interactive"
        disabled={isDisabled}
        onClose={() => navigation.goBack()}
        onStreamingComplete={handleStreamingComplete}
      >
        {addPerson.showBirthDatePicker && (
          <BirthDatePicker
            birthDateState={addPerson.birthDateState}
            onDateChange={(updates) =>
              addPerson.setBirthDateState((prev) => ({ ...prev, ...updates }))
            }
            onConfirm={addPerson.handleBirthDateConfirm}
            title="Select their birth date"
          />
        )}

        {birthMap.showTimePicker && (
          <TimePicker
            hour={birthMap.birthTime.hour}
            minute={birthMap.birthTime.minute}
            onTimeChange={(updates) =>
              birthMap.setBirthTime((prev) => ({ ...prev, ...updates }))
            }
            onConfirm={birthMap.handleTimeConfirm}
          />
        )}

        {birthMap.showLocationSearch && (
          <LocationSearch
            onLocationSelect={(location) => birthMap.setBirthLocation(location)}
            onConfirm={birthMap.handleLocationConfirm}
          />
        )}
      </ChatSessionCore>

      {/* Hidden view to capture chart as PNG */}
      {chartCapture.pendingCapture && (
        <View style={[StyleSheet.absoluteFill, styles.hiddenCapture]} pointerEvents="none">
          <ViewShot
            ref={chartCapture.captureViewRef}
            options={{ format: "png", result: "tmpfile" }}
            style={{ width: CAPTURE_SIZE, height: CAPTURE_SIZE }}
          >
            <NatalChartView
              chartData={chartCapture.pendingCapture.chartData}
              size={CAPTURE_SIZE}
            />
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
