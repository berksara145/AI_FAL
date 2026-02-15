import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";

import ChatSessionCore, { type ChatMessage } from "./components/ChatSessionCore";
import BirthMapChatWrapper from "../../screens/orbit/BirthMapChatWrapper";
import BirthDatePicker from "../onboarding/components/BirthDatePicker";
import type { BirthDateState } from "../onboarding/hooks/useOnboardingState";
import { ChatSessionService, type ChatSessionMessage } from "../../lib/chatSessionService";
import { addMessage } from "../../db/chat.repo";
import { createPersonMinimal } from "../../db/person.repo";

type ChatSessionRouteProp = RouteProp<RootStackParamList, "ChatSession">;

function toCoreMessage(m: ChatSessionMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
  };
}

const FEATURE_SOMEONE_ON_MIND = "Someone on your mind?";

export default function ChatSessionScreen() {
  const route = useRoute<ChatSessionRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { sessionId, mode = "interactive", feature, initialMessage, agenda } = route.params || {};

  if (feature === "birthMap") {
    return (
      <BirthMapChatWrapper
        personName={(route.params as any)?.personName}
        birthDate={(route.params as any)?.birthDate}
      />
    );
  }

  const serviceRef = useRef<ChatSessionService | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("Chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inline save-person flow (same chat, no new session): name + birth date (day/month/year) like Orbit
  const [pendingSavePerson, setPendingSavePerson] = useState<string | null>(null);
  const [savePersonName, setSavePersonName] = useState("");
  const defaultYear = new Date().getFullYear() - 25;
  const [savePersonBirthDate, setSavePersonBirthDate] = useState<BirthDateState>({
    year: defaultYear,
    month: 1,
    day: 1,
  });

  useEffect(() => {
    const run = async () => {
      const service = new ChatSessionService({
        agenda: agenda ?? "You are a warm, supportive assistant. Keep responses concise and helpful.",
        feature,
        initialMessage,
        mode,
        enableSavePersonHint: feature === FEATURE_SOMEONE_ON_MIND,
      });
      serviceRef.current = service;

      try {
        setIsLoading(true);
        const existingId = sessionId != null ? Number(sessionId) : undefined;
        const { sessionId: sid, session, messages: msgs } = await service.initializeSession(
          existingId
        );
        setSessionTitle(session?.title || feature || session?.feature || "Chat");
        setMessages(msgs.map(toCoreMessage));
      } catch (e) {
        console.error("ChatSessionScreen: init error", e);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const handleSendMessage = async (text: string) => {
    const service = serviceRef.current;
    if (!service || !text.trim()) return;

    setIsTyping(true);
    try {
      const result = await service.sendMessage(text);
      const msgs = await service.getMessages();
      setMessages(msgs.map(toCoreMessage));
      if (result.suggestedSavePerson != null) {
        setSavePersonName(result.suggestedSavePerson);
        setPendingSavePerson(result.suggestedSavePerson);
      }
    } catch (e) {
      console.error("ChatSessionScreen: send error", e);
      const msgs = await service.getMessages();
      setMessages(msgs.map(toCoreMessage));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSavePersonConfirm = async () => {
    const service = serviceRef.current;
    const sid = service?.getSessionId();
    if (sid == null) return;
    const name = (savePersonName || pendingSavePerson || "").trim() || "Unknown";
    const y = savePersonBirthDate.year ?? new Date().getFullYear();
    const m = savePersonBirthDate.month ?? 1;
    const d = savePersonBirthDate.day ?? 1;

    setPendingSavePerson(null);
    setSavePersonName("");
    setSavePersonBirthDate({ year: defaultYear, month: 1, day: 1 });

    await createPersonMinimal({ name, birth_year: y, birth_month: m, birth_day: d });
    await addMessage({
      sessionId: sid,
      role: "assistant",
      content: `Added ${name} to your orbit! ✨`,
    });
    const msgs = await service!.getMessages();
    setMessages(msgs.map(toCoreMessage));
  };

  const handleSavePersonCancel = () => {
    setPendingSavePerson(null);
    setSavePersonName("");
  };

  return (
    <ChatSessionCore
      title={sessionTitle}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      isTyping={isTyping}
      mode={mode}
      disabled={pendingSavePerson !== null}
      onClose={() => navigation.goBack()}
    >
      {pendingSavePerson !== null && (
        <View style={styles.savePersonSection}>
          <Text style={styles.savePersonTitle}>Save to Orbit?</Text>
          <Text style={styles.savePersonSubtitle}>
            Same protocol as Orbit: name and birth date (day, month, year).
          </Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={savePersonName}
            onChangeText={setSavePersonName}
            editable={true}
          />
          <BirthDatePicker
            birthDateState={savePersonBirthDate}
            onDateChange={(updates) =>
              setSavePersonBirthDate((prev) => ({ ...prev, ...updates }))
            }
            onConfirm={handleSavePersonConfirm}
            title="Select their birth date"
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleSavePersonCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ChatSessionCore>
  );
}

const styles = StyleSheet.create({
  savePersonSection: {
    backgroundColor: "#1a0d2e",
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  savePersonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d4af37",
    marginBottom: 4,
  },
  savePersonSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 12,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  cancelButtonText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
  },
});
