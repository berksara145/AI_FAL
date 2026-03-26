import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";

import ChatSessionCore, { type ChatMessage } from "./components/ChatSessionCore";
import SuggestionChips from "./components/SuggestionChips";
import BirthMapChatWrapper from "../../screens/orbit/BirthMapChatWrapper";
import BirthDatePicker from "../onboarding/components/BirthDatePicker";
import TarotReveal from "./components/TarotReveal";
import CrossroadsCard from "./components/CrossroadsCard";
import { ChatSessionService, generateFollowUpChips, type ChatSessionMessage } from "../../lib/chatSessionService";
import { getPersonsWithChartData, getSelfPerson, type Person } from "../../db/person.repo";
import { getReadingByDate, getReadingBySessionId } from "../../db/tarot.repo";
import { getCardById, type TarotCard } from "../../lib/tarotDeck";
import { drawCrossroadsCardForDate, resolveTarotCard, type CrossroadsCard as CrossroadsCardData } from "../../lib/cosmicCrossroads";
import { useSavePersonFlow } from "./hooks/useSavePersonFlow";
import { useTarotReading } from "./hooks/useTarotReading";
import { useCrossroadsReading } from "./hooks/useCrossroadsReading";
import { Colors } from "../../utils/theme";
import { useTranslation } from "react-i18next";
import i18n from "../../lib/i18n";

type ChatSessionRouteProp = RouteProp<RootStackParamList, "ChatSession">;

function toCoreMessage(m: ChatSessionMessage): ChatMessage {
  return { id: m.id, role: m.role, content: m.content, timestamp: m.timestamp };
}

const FEATURE_SOMEONE_SPECIAL = "Someone Special";
const FEATURE_FRIEND_DYNAMICS = "Friend Dynamics";
const FEATURE_NATAL_CHART_ANALYSIS = "Natal Chart Analysis";
const FEATURE_TAROT = "Tarot Reading";
const FEATURE_COSMIC_CROSSROADS = "Cosmic Crossroads";

export default function ChatSessionScreen() {
  const { t } = useTranslation();
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
  const selfPersonRef = useRef<Person | null>(null);
  const activeChartPersonRef = useRef<Person | null>(null);
  const [sessionTitle, setSessionTitle] = useState("Chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPersons, setChartPersons] = useState<Person[]>([]);
  const [noCharts, setNoCharts] = useState(false);
  const [personSelected, setPersonSelected] = useState(false);
  const [compatibilityPersonSelected, setCompatibilityPersonSelected] = useState(false);
  const [natalChips, setNatalChips] = useState<string[]>([]);
  const [tarotChips, setTarotChips] = useState<string[]>([]);
  const tarotChipsInitRef = useRef(false);
  const [readonlyTarotCards, setReadonlyTarotCards] = useState<[TarotCard, TarotCard, TarotCard] | null>(null);
  const [readonlyCrossroadsCard, setReadonlyCrossroadsCard] = useState<CrossroadsCardData | null>(null);

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

  const tarot = useTarotReading(serviceRef, refreshMessages);
  const crossroads = useCrossroadsReading();

  useEffect(() => {
    if (
      feature === FEATURE_TAROT &&
      tarot.allRevealed &&
      !tarot.generatingInterpretation &&
      !tarotChipsInitRef.current
    ) {
      tarotChipsInitRef.current = true;
      setTarotChips([
        t("tarot.suggestMeaning"),
        t("tarot.suggestPast"),
        t("tarot.suggestAction"),
        t("tarot.suggestMessage"),
      ]);
    }
  }, [tarot.allRevealed, tarot.generatingInterpretation]);

  useEffect(() => {
    const init = async () => {
      let effectiveInitialMessage = initialMessage;

      if (feature === FEATURE_NATAL_CHART_ANALYSIS) {
        const personsWithCharts = await getPersonsWithChartData();
        chartPersonsRef.current = personsWithCharts;
        if (personsWithCharts.length === 0) {
          setNoCharts(true);
          effectiveInitialMessage = t("chat.noBirthCharts");
        } else {
          setChartPersons(personsWithCharts);
          effectiveInitialMessage = t("chat.selectBirthChart");
        }
      }

      if (feature === FEATURE_SOMEONE_SPECIAL) {
        const selfPerson = await getSelfPerson();
        selfPersonRef.current = selfPerson ?? null;
        if (!selfPerson?.chart_gpt_json) {
          setNoCharts(true);
          effectiveInitialMessage = t("chat.noSelfChart");
        } else {
          const personsWithCharts = await getPersonsWithChartData();
          const others = personsWithCharts.filter(
            (p) => p.name?.toLowerCase() !== (selfPerson.name ?? "").toLowerCase()
          );
          chartPersonsRef.current = others;
          if (others.length === 0) {
            setNoCharts(true);
            effectiveInitialMessage = t("chat.noPartnerChart");
          } else {
            setChartPersons(others);
            effectiveInitialMessage = t("chat.whosOnYourMind");
          }
        }
      }

      if (feature === FEATURE_FRIEND_DYNAMICS) {
        const selfPerson = await getSelfPerson();
        selfPersonRef.current = selfPerson ?? null;
        if (!selfPerson?.chart_gpt_json) {
          setNoCharts(true);
          effectiveInitialMessage = t("chat.noSelfChart");
        } else {
          const personsWithCharts = await getPersonsWithChartData();
          const others = personsWithCharts.filter(
            (p) => p.name?.toLowerCase() !== (selfPerson.name ?? "").toLowerCase()
          );
          chartPersonsRef.current = others;
          if (others.length === 0) {
            setNoCharts(true);
            effectiveInitialMessage = t("chat.noFriendChart");
          } else {
            setChartPersons(others);
            effectiveInitialMessage = t("chat.whosYourFriend");
          }
        }
      }



      const service = new ChatSessionService({
        agenda: agenda ?? "You are a warm, supportive assistant. Keep responses concise and helpful.",
        feature,
        initialMessage: effectiveInitialMessage,
        mode,
        enableSavePersonHint: false,
      });
      serviceRef.current = service;

      try {
        setIsLoading(true);
        const existingId = sessionId != null ? Number(sessionId) : undefined;
        const { session, messages: msgs } = await service.initializeSession(existingId);
        setSessionTitle(session?.title || feature || session?.feature || "Chat");
        setMessages(msgs.map(toCoreMessage));
        // If crossroads session already has a reading, mark card as revealed
        if (feature === FEATURE_COSMIC_CROSSROADS && msgs.length > 1) {
          crossroads.markDone();
        }
        // Readonly: load the historic card for tarot / crossroads
        if (mode === "readonly" && session?.created_at) {
          const sessionDate = new Date(session.created_at);
          const dateStr = session.created_at.slice(0, 10);
          if (feature === FEATURE_TAROT) {
            const sid = session?.id ?? (existingId ?? null);
            const reading = sid
              ? (await getReadingBySessionId(sid)) ?? (await getReadingByDate(dateStr))
              : await getReadingByDate(dateStr);
            if (reading) {
              const past   = getCardById(reading.card_past);
              const today  = getCardById(reading.card_today);
              const future = getCardById(reading.card_future);
              if (past && today && future) setReadonlyTarotCards([past, today, future]);
            }
          }
          if (feature === FEATURE_COSMIC_CROSSROADS) {
            setReadonlyCrossroadsCard(drawCrossroadsCardForDate(sessionDate));
          }
        }
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
    if (!service || !text.trim() || isTyping) return;

    // Cosmic Crossroads: first user message triggers card reveal + oracle reading
    if (feature === FEATURE_COSMIC_CROSSROADS && !crossroads.revealed) {
      setIsTyping(true);
      try {
        await crossroads.handleQuestion(text.trim(), service, refreshMessages);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    const displayText = text.trim();
    let gptContent = displayText;

    if (feature === FEATURE_NATAL_CHART_ANALYSIS) {
      const active = activeChartPersonRef.current;
      if (active?.chart_gpt_json) {
        gptContent =
          displayText +
          `\n\n[Chart context for ${active.name} — use this to answer]\n--- ${active.name} ---\n${active.chart_gpt_json}`;
      }
    }
    if (feature === FEATURE_SOMEONE_SPECIAL || feature === FEATURE_FRIEND_DYNAMICS) {
      const active = activeChartPersonRef.current;
      const self = selfPersonRef.current;
      if (active?.chart_gpt_json && self?.chart_gpt_json) {
        gptContent =
          displayText +
          `\n\n[Chart context — use this to answer]\n--- ${self.name} (You) ---\n${self.chart_gpt_json}\n--- ${active.name} ---\n${active.chart_gpt_json}`;
      }
    }

    setIsTyping(true);
    try {
      const result = await service.sendMessage(gptContent, { displayContent: displayText });
      await refreshMessages();
      if (result.suggestedSavePerson != null) {
        savePerson.suggest(result.suggestedSavePerson);
      }
      if (feature === FEATURE_NATAL_CHART_ANALYSIS) {
        generateFollowUpChips(displayText, result.reply).then((chips) => {
          if (chips.length > 0) setNatalChips(chips);
        });
      }
      if (feature === FEATURE_TAROT) {
        generateFollowUpChips(displayText, result.reply, "tarot").then((chips) => {
          if (chips.length > 0) setTarotChips(chips);
        });
      }
    } catch (e) {
      console.error("[ChatSessionScreen] send error:", e);
      await refreshMessages();
    } finally {
      setIsTyping(false);
    }
  };

  const handlePersonSelect = async (person: Person) => {
    const service = serviceRef.current;
    if (!service || isTyping) return;

    const isTr = i18n.language === "tr";
    const parts = isTr
      ? [`${person.name}'nin doğum haritasını oku.`]
      : [`Read ${person.name}'s birth chart.`];
    if (person.chart_gpt_json) {
      parts.push(isTr ? "[Ekli harita verileri — yalnızca bunu analiz için kullan]" : "[Attached chart data — use only this for analysis]");
      parts.push(`--- ${person.name} ---\n${person.chart_gpt_json}`);
    }
    const messageToSend = parts.join("\n\n");

    setIsTyping(true);
    setPersonSelected(true);
    setNatalChips([
      t("chat.natalSuggestLove"),
      t("chat.natalSuggestCareer"),
      t("chat.natalSuggestEmotions"),
      t("chat.natalSuggestChallenge"),
    ]);
    activeChartPersonRef.current = person;
    try {
      await service.sendMessage(messageToSend, { displayContent: isTr ? `${person.name}'in doğum haritasını analiz et.` : `Analyze ${person.name}'s birth chart.` });
      await refreshMessages();
    } catch (e) {
      console.error("[ChatSessionScreen] chart analysis error:", e);
      await refreshMessages();
    } finally {
      setIsTyping(false);
    }
  };

  const handleCompatibilitySelect = async (person: Person) => {
    const service = serviceRef.current;
    const selfPerson = selfPersonRef.current;
    if (!service || isTyping || !selfPerson?.chart_gpt_json || !person.chart_gpt_json) return;

    const isTrCompat = i18n.language === "tr";
    const prompt = isTrCompat
      ? feature === FEATURE_FRIEND_DYNAMICS
        ? `${selfPerson.name} ile ${person.name} arasında kısa bir arkadaşlık uyumluluk okuması yap. Arkadaşlıklarını işleten şeyleri ve sürtüşmenin nerede çıkabileceğini göster. En fazla 3 temel nokta — her biri için bir cümle. Her nokta için kalın başlık. Sade ve anlaşılır dil. 100 kelimeden az. Türkçe yanıt ver.`
        : `${selfPerson.name} ile ${person.name} arasında kısa bir uyumluluk okuması yap. En fazla 3 temel bağlantı noktası — her biri için bir cümle. Her nokta için kalın başlık. Sade ve anlaşılır dil. 100 kelimeden az. Türkçe yanıt ver.`
      : feature === FEATURE_FRIEND_DYNAMICS
        ? `Give a short friendship compatibility reading between ${selfPerson.name} and ${person.name}. What makes their friendship work and where friction might arise. Pick 3 key points max — one sentence each. Bold header per point. Simple plain language. Under 100 words total.`
        : `Give a short compatibility reading between ${selfPerson.name} and ${person.name}. Pick 3 key connection points max — one sentence each. Bold header per point. Simple plain language. Under 100 words total.`;

    const parts = [
      prompt,
      isTrCompat ? "[Ekli harita verileri — okuma için her iki haritayı karşılaştır]" : "[Attached chart data — compare both charts for the reading]",
      `--- ${selfPerson.name} (${isTrCompat ? "Sen" : "You"}) ---\n${selfPerson.chart_gpt_json}`,
      `--- ${person.name} ---\n${person.chart_gpt_json}`,
    ];

    setIsTyping(true);
    setCompatibilityPersonSelected(true);
    activeChartPersonRef.current = person;
    try {
      const displayMsg = isTrCompat
        ? feature === FEATURE_FRIEND_DYNAMICS
          ? `${person.name} ile arkadaşlık dinamiğim hakkında bilgi ver.`
          : `${person.name} ile uyumluluğum hakkında bilgi ver.`
        : feature === FEATURE_FRIEND_DYNAMICS
          ? `Tell me about my friendship dynamic with ${person.name}.`
          : `Tell me about my compatibility with ${person.name}.`;
      await service.sendMessage(parts.join("\n\n"), { displayContent: displayMsg });
      await refreshMessages();
    } catch (e) {
      await refreshMessages();
    } finally {
      setIsTyping(false);
    }
  };

  const lastMessageIsAssistant = messages.length > 0 && messages[messages.length - 1]?.role === "assistant";
  const activeNatalChips = natalChips.map((text, i) => ({ id: String(i), text }));

  const activeTarotChips = tarotChips.map((text, i) => ({ id: String(i), text }));
  const tarotSuggestionsBar = feature === FEATURE_TAROT && tarot.allRevealed && !tarot.generatingInterpretation && !isTyping && lastMessageIsAssistant && activeTarotChips.length > 0
    ? (
      <SuggestionChips
        suggestions={activeTarotChips}
        onSelect={(s) => handleSendMessage(s.text)}
      />
    )
    : null;

  const suggestionsBar = feature === FEATURE_NATAL_CHART_ANALYSIS && personSelected && !isTyping && lastMessageIsAssistant && activeNatalChips.length > 0
    ? (
      <SuggestionChips
        suggestions={activeNatalChips}
        onSelect={(s) => handleSendMessage(s.text)}
      />
    )
    : null;

  const natalChartBar = feature === FEATURE_NATAL_CHART_ANALYSIS && !isLoading && !personSelected && savePerson.pendingSavePerson === null
    ? noCharts
      ? (
        <View style={styles.personButtonsRow}>
          <TouchableOpacity
            style={[styles.personButton, styles.createChartButton]}
            onPress={() =>
              navigation.navigate("MainApp" as any, {
                screen: "MainTabs",
                params: { screen: "Orbit" },
              } as any)
            }
            activeOpacity={0.7}
          >
            <Text style={styles.personButtonText}>{t("chat.goToBirthChart")}</Text>
          </TouchableOpacity>
        </View>
      )
      : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personButtonsRow}>
          {chartPersons.map((p) => (
            <TouchableOpacity
              key={p.name}
              style={styles.personButton}
              onPress={() => handlePersonSelect(p)}
              activeOpacity={0.7}
              disabled={isTyping}
            >
              <Text style={styles.personButtonText}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )
    : null;

  const friendDynamicsBar = feature === FEATURE_FRIEND_DYNAMICS && !isLoading && !compatibilityPersonSelected && savePerson.pendingSavePerson === null
    ? noCharts
      ? (
        <View style={styles.personButtonsRow}>
          <TouchableOpacity
            style={[styles.personButton, styles.createChartButton]}
            onPress={() =>
              navigation.navigate("MainApp" as any, {
                screen: "MainTabs",
                params: { screen: "Orbit" },
              } as any)
            }
            activeOpacity={0.7}
          >
            <Text style={styles.personButtonText}>{t("chat.goToBirthChart")}</Text>
          </TouchableOpacity>
        </View>
      )
      : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personButtonsRow}>
          {chartPersons.map((p) => (
            <TouchableOpacity
              key={p.name}
              style={styles.personButton}
              onPress={() => handleCompatibilitySelect(p)}
              activeOpacity={0.7}
              disabled={isTyping}
            >
              <Text style={styles.personButtonText}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )
    : null;

  const someoneSpecialBar = feature === FEATURE_SOMEONE_SPECIAL && !isLoading && !compatibilityPersonSelected && savePerson.pendingSavePerson === null
    ? noCharts
      ? (
        <View style={styles.personButtonsRow}>
          <TouchableOpacity
            style={[styles.personButton, styles.createChartButton]}
            onPress={() =>
              navigation.navigate("MainApp" as any, {
                screen: "MainTabs",
                params: { screen: "Orbit" },
              } as any)
            }
            activeOpacity={0.7}
          >
            <Text style={styles.personButtonText}>{t("chat.goToBirthChart")}</Text>
          </TouchableOpacity>
        </View>
      )
      : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personButtonsRow}>
          {chartPersons.map((p) => (
            <TouchableOpacity
              key={p.name}
              style={styles.personButton}
              onPress={() => handleCompatibilitySelect(p)}
              activeOpacity={0.7}
              disabled={isTyping}
            >
              <Text style={styles.personButtonText}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )
    : null;

  const tarotBar = feature === FEATURE_TAROT && mode !== "readonly" && !isLoading && !tarot.loading && tarot.cards
    ? (
      <TarotReveal
        cards={tarot.cards}
        revealed={tarot.revealed}
        onReveal={tarot.handleReveal}
        generatingInterpretation={tarot.generatingInterpretation}
      />
    )
    : null;

  const crossroadsBar = feature === FEATURE_COSMIC_CROSSROADS && mode !== "readonly" && !isLoading
    ? (
      <CrossroadsCard
        card={crossroads.card}
        tarotCard={crossroads.tarotCard}
        revealed={crossroads.revealed}
        generating={crossroads.generating}
      />
    )
    : null;

  // Readonly: static versions of the card(s) shown in history
  const readonlyTarotBar = mode === "readonly" && readonlyTarotCards
    ? (
      <TarotReveal
        cards={readonlyTarotCards}
        revealed={[true, true, true]}
        onReveal={() => {}}
        generatingInterpretation={false}
      />
    )
    : null;

  const readonlyCrossroadsBar = mode === "readonly" && readonlyCrossroadsCard
    ? (
      <CrossroadsCard
        card={readonlyCrossroadsCard}
        tarotCard={resolveTarotCard(readonlyCrossroadsCard)}
        revealed={true}
        generating={false}
      />
    )
    : null;

  return (
    <ChatSessionCore
      title={sessionTitle}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      isTyping={isTyping}
      mode={mode}
      disabled={savePerson.pendingSavePerson !== null || (feature === FEATURE_TAROT && !tarot.allRevealed)}
      onClose={() => navigation.goBack()}
      trailingContent={natalChartBar ?? someoneSpecialBar ?? friendDynamicsBar ?? suggestionsBar ?? tarotSuggestionsBar ?? undefined}
      headerContent={tarotBar ?? crossroadsBar ?? readonlyTarotBar ?? readonlyCrossroadsBar ?? undefined}
    >

      {savePerson.pendingSavePerson !== null && (
        <View style={styles.savePersonSection}>
          <Text style={styles.savePersonTitle}>{t("chat.saveToChart")}</Text>
          <Text style={styles.savePersonSubtitle}>{t("chat.saveToChartSubtitle")}</Text>
          <TextInput
            style={styles.nameInput}
            placeholder={t("chat.namePlaceholder")}
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
            title={t("onboarding.selectTheirBirthDate")}
          />
          <TouchableOpacity style={styles.cancelButton} onPress={savePerson.handleCancel} activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ChatSessionCore>
  );
}

const styles = StyleSheet.create({
  personButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  personButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(120,80,200,0.35)",
    backgroundColor: "#2d1f5e",
  },
  createChartButton: {
    backgroundColor: "#2d1f5e",
  },
  personButtonText: {
    color: Colors.goldPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
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
