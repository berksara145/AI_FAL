import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";

import ChatSessionCore, { type ChatMessage } from "./components/ChatSessionCore";
import BirthMapChatWrapper from "../../screens/orbit/BirthMapChatWrapper";
import BirthDatePicker from "../onboarding/components/BirthDatePicker";
import { ChatSessionService, type ChatSessionMessage } from "../../lib/chatSessionService";
import { getPersonsWithChartData, type Person } from "../../db/person.repo";
import { useSavePersonFlow } from "./hooks/useSavePersonFlow";
import { Colors } from "../../utils/theme";

type ChatSessionRouteProp = RouteProp<RootStackParamList, "ChatSession">;

function toCoreMessage(m: ChatSessionMessage): ChatMessage {
  return { id: m.id, role: m.role, content: m.content, timestamp: m.timestamp };
}

const FEATURE_SOMEONE_ON_MIND = "Someone on your mind?";
const FEATURE_NATAL_CHART_ANALYSIS = "Natal Chart Analysis";

export default function ChatSessionScreen() {
  const route = useRoute<ChatSessionRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { sessionId, mode = "interactive", feature, initialMessage, agenda } = route.params || {};

  // Birth map is a completely separate flow
  if (feature === "birthMap") {
    return (
      <BirthMapChatWrapper
        personName={(route.params as any)?.personName}
        birthDate={(route.params as any)?.birthDate}
      />
    );
  }

  const serviceRef = useRef<ChatSessionService | null>(null);
  const chartPersonsRef = useRef<Person[]>([]);
  const [sessionTitle, setSessionTitle] = useState("Chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMessages = async () => {
    const service = serviceRef.current;
    if (!service) return;
    const msgs = await service.getMessages();
    setMessages(msgs.map(toCoreMessage));
  };

  const savePerson = useSavePersonFlow(
    () => serviceRef.current?.getSessionId() ?? null,
    refreshMessages
  );

  useEffect(() => {
    const init = async () => {
      let effectiveInitialMessage = initialMessage;

      if (feature === FEATURE_NATAL_CHART_ANALYSIS) {
        const personsWithCharts = await getPersonsWithChartData();
        chartPersonsRef.current = personsWithCharts;
        const names = personsWithCharts.map((p) => p.name ?? "").filter(Boolean);
        effectiveInitialMessage = names.length > 0
          ? `🪐 I have natal charts for: ${names.join(", ")}. Type one or more of these names (e.g. ${names[0]}) and I'll analyze their chart.`
          : "🪐 You don't have any natal charts yet. Add people in Birth Chart and generate their birth charts there — then come back here to get an analysis.";
      }

      const service = new ChatSessionService({
        agenda: agenda ?? "You are a warm, supportive assistant. Keep responses concise and helpful.",
        feature,
        initialMessage: effectiveInitialMessage,
        mode,
        enableSavePersonHint: feature === FEATURE_SOMEONE_ON_MIND,
      });
      serviceRef.current = service;

      try {
        setIsLoading(true);
        const existingId = sessionId != null ? Number(sessionId) : undefined;
        const { session, messages: msgs } = await service.initializeSession(existingId);
        setSessionTitle(session?.title || feature || session?.feature || "Chat");
        setMessages(msgs.map(toCoreMessage));
      } catch (e) {
        console.error("[ChatSessionScreen] init error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSendMessage = async (text: string) => {
    const service = serviceRef.current;
    if (!service || !text.trim()) return;

    // Inject chart JSON when user mentions a person by name
    let messageToSend = text.trim();
    if (feature === FEATURE_NATAL_CHART_ANALYSIS && chartPersonsRef.current.length > 0) {
      const lower = messageToSend.toLowerCase();
      const matched = chartPersonsRef.current.filter(
        (p) => p.name && lower.includes((p.name ?? "").toLowerCase())
      );
      if (matched.length > 0) {
        const parts = ["[Attached chart data for analysis — use only these when answering]"];
        for (const p of matched) {
          if (p.chart_gpt_json) parts.push(`--- ${p.name} ---\n${p.chart_gpt_json}`);
        }
        messageToSend = messageToSend + "\n\n" + parts.join("\n\n");
      }
    }

    setIsTyping(true);
    try {
      const result = await service.sendMessage(messageToSend);
      await refreshMessages();
      if (result.suggestedSavePerson != null) {
        savePerson.suggest(result.suggestedSavePerson);
      }
    } catch (e) {
      console.error("[ChatSessionScreen] send error:", e);
      await refreshMessages();
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatSessionCore
      title={sessionTitle}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      isTyping={isTyping}
      mode={mode}
      disabled={savePerson.pendingSavePerson !== null}
      onClose={() => navigation.goBack()}
    >
      {savePerson.pendingSavePerson !== null && (
        <View style={styles.savePersonSection}>
          <Text style={styles.savePersonTitle}>Save to Birth Chart?</Text>
          <Text style={styles.savePersonSubtitle}>
            Same protocol as Birth Chart: name and birth date (day, month, year).
          </Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Name"
            placeholderTextColor={Colors.textFaint}
            value={savePerson.savePersonName}
            onChangeText={savePerson.setSavePersonName}
          />
          {savePerson.savePersonError != null && (
            <Text style={styles.errorText}>{savePerson.savePersonError}</Text>
          )}
          <BirthDatePicker
            birthDateState={savePerson.savePersonBirthDate}
            onDateChange={(updates) =>
              savePerson.setSavePersonBirthDate((prev) => ({ ...prev, ...updates }))
            }
            onConfirm={savePerson.handleConfirm}
            title="Select their birth date"
          />
          <TouchableOpacity style={styles.cancelButton} onPress={savePerson.handleCancel} activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ChatSessionCore>
  );
}

const styles = StyleSheet.create({
  savePersonSection: {
    backgroundColor: Colors.bgMain,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGold,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  savePersonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.goldPrimary,
    marginBottom: 4,
  },
  savePersonSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginBottom: 12,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
});
