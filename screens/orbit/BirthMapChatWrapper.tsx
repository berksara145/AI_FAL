import React, { useRef, useCallback } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import ViewShot from "react-native-view-shot";
import NatalChartView from "./components/NatalChartView";

// i18n
import { useTranslation } from "react-i18next";

// Hooks
import { useChatSession } from "./hooks/useChatSession";
import { useAddPersonFlow } from "./hooks/useAddPersonFlow";
import { useBirthMapFlow } from "./hooks/useBirthMapFlow";
import { useChartCapture } from "./hooks/useChartCapture";
import { personToBirthDate } from "./hooks/useOrbitNodes";

// Utils
import { getZodiacInfoForMonthDay } from "./utils";

// DB
import { getPersonByName } from "../../db/person.repo";

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
  const { t } = useTranslation();
  const route = useRoute<BirthMapRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const personNameFromParams = incomingPersonName ?? (route.params as any)?.personName;
  const sessionIdParam = (route.params as any)?.sessionId;
  const isAddPersonFlow = !personNameFromParams;

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const effectivePersonNameRef = useRef<string | null>(null);
  const navigateBack = useCallback(() => {
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => navigation.goBack());
  }, [navigation, screenOpacity]);

  // --- Hooks ---
  const chat = useChatSession({
    sessionId: sessionIdParam ? Number(sessionIdParam) : undefined,
    isAddPersonFlow,
    personName: personNameFromParams,
  });

  const addPerson = useAddPersonFlow(
    chat.appendMessage,
    () => navigateBack()
  );

  const effectivePersonName = personNameFromParams ?? addPerson.createdPersonName;
  effectivePersonNameRef.current = effectivePersonName;

  const chartCapture = useChartCapture(async () => {
    await chat.appendMessage("assistant", t("birthMap.complete"));
    await new Promise((r) => setTimeout(r, 1400));

    const name = effectivePersonNameRef.current ?? "";
    if (!name) { navigateBack(); return; }

    const person = await getPersonByName(name);
    const zodiacInfo =
      person?.birth_month != null && person?.birth_day != null
        ? getZodiacInfoForMonthDay(person.birth_month, person.birth_day)
        : null;

    (navigation as any).navigate("MainApp", {
      screen: "PersonDetail",
      params: {
        name,
        zodiac: zodiacInfo?.name ?? "",
        zodiacSymbol: zodiacInfo?.symbol ?? "",
        birthDate: person ? personToBirthDate(person) : "",
      },
    });
  });

  const birthMap = useBirthMapFlow(
    effectivePersonName,
    chat.appendMessage,
    (chart) => {
      const name = effectivePersonName ?? chart.chartData.birthData.name ?? "";
      if (name && chart.svgContent) {
        chartCapture.startCapture(chart.svgContent, name, chart.chartData);
      } else {
        navigateBack();
      }
    },
    () => navigateBack()
  );

  // --- Streaming complete: trigger pickers based on message content ---
  const handleStreamingComplete = (messageId: string) => {
    chat.setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const content = msg.content.toLowerCase();

        if (isAddPersonFlow && addPerson.step === "birthDate" && content.includes("birth date") && content.includes("below")) {
          setTimeout(() => addPerson.openBirthDatePicker(), 800);
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

  const isStreaming = chat.messages.some((m) => m.isStreaming);
  const isDisabled =
    birthMap.showTimePicker ||
    birthMap.showLocationSearch ||
    addPerson.showBirthDatePicker ||
    birthMap.isGenerating;

  return (
    <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
      <ChatSessionCore
        title={t("birthMap.title")}
        messages={chat.messages}
        onSendMessage={handleSendMessage}
        isLoading={chat.isLoading}
        isTyping={isStreaming}
        mode="interactive"
        disabled={isDisabled}
        onClose={() => navigateBack()}
        onStreamingComplete={handleStreamingComplete}
      >
        {addPerson.showBirthDatePicker && (
          <BirthDatePicker
            birthDateState={addPerson.birthDateState}
            onDateChange={(updates) =>
              addPerson.setBirthDateState((prev) => ({ ...prev, ...updates }))
            }
            onConfirm={addPerson.handleBirthDateConfirm}
            title={t("onboarding.selectTheirBirthDate")}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hiddenCapture: {
    opacity: 0,
    left: -9999,
    top: 0,
  },
});
