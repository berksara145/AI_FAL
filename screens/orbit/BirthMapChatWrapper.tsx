import React, { useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useRoute, useNavigation, CommonActions } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import ViewShot from "react-native-view-shot";
import NatalChartView from "./components/NatalChartView";

import { useTranslation } from "react-i18next";

import { useChatSession } from "./hooks/useChatSession";
import { useAddPersonFlow } from "./hooks/useAddPersonFlow";
import { useBirthMapFlow } from "./hooks/useBirthMapFlow";
import { useChartCapture } from "./hooks/useChartCapture";
import { personToBirthDate } from "./hooks/useOrbitNodes";

import { getZodiacInfoForMonthDay } from "./utils";
import { getPersonByName } from "../../db/person.repo";

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

  const effectivePersonNameRef = useRef<string | null>(null);
  const navigateBack = useCallback(() => navigation.goBack(), [navigation]);

  // --- Hooks (order matters for deps) ---
  const chat = useChatSession({
    sessionId: sessionIdParam ? Number(sessionIdParam) : undefined,
    isAddPersonFlow,
    personName: personNameFromParams,
  });

  const addPerson = useAddPersonFlow(chat.appendMessage, navigateBack);

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

    // Reset the root stack: dismiss ChatSession entirely and land on PersonDetail
    // as a regular card push inside MainApp — avoids sheet/modal presentation on iOS
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "MainApp",
            state: {
              index: 1,
              routes: [
                { name: "MainTabs" },
                {
                  name: "PersonDetail",
                  params: {
                    name,
                    zodiac: zodiacInfo?.name ?? "",
                    zodiacSymbol: zodiacInfo?.symbol ?? "",
                    birthDate: person ? personToBirthDate(person) : "",
                  },
                },
              ],
            },
          },
        ],
      })
    );
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
    navigateBack
  );

  // --- Streaming complete ---
  // No English keyword matching — uses explicit flags set by the hooks themselves
  const handleStreamingComplete = (messageId: string) => {
    chat.setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        if (isAddPersonFlow) {
          if (addPerson.pendingTimePicker) {
            // "What time was X born?" message just finished streaming → show time picker
            addPerson.clearPendingTimePicker();
            birthMap.expectTimePicker();
          } else if (addPerson.step === "birthDate") {
            // "Select birth date below" message finished → show date picker
            setTimeout(() => addPerson.openBirthDatePicker(), 800);
          }
        }

        birthMap.handleStreamingComplete(messageId, msg.content);

        return { ...msg, isStreaming: false };
      })
    );
  };

  // --- Send message ---
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
  };

  const isStreaming = chat.messages.some((m) => m.isStreaming);
  const isDisabled =
    birthMap.showTimePicker ||
    birthMap.showLocationSearch ||
    addPerson.showBirthDatePicker ||
    birthMap.isGenerating;

  return (
    <View style={{ flex: 1 }}>
      <ChatSessionCore
        title={t("birthMap.title")}
        messages={chat.messages}
        onSendMessage={handleSendMessage}
        isLoading={chat.isLoading}
        isTyping={isStreaming}
        mode="interactive"
        disabled={isDisabled}
        onClose={navigateBack}
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
            onDontKnow={birthMap.handleTimeUnknown}
          />
        )}

        {birthMap.showLocationSearch && (
          <LocationSearch
            onLocationSelect={(location) => birthMap.setBirthLocation(location)}
            onConfirm={birthMap.handleLocationConfirm}
          />
        )}
      </ChatSessionCore>

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
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenCapture: {
    opacity: 0,
    left: -9999,
    top: 0,
  },
});
