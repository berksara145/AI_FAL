import { useState, useEffect, useRef } from "react";
import { saveTarotReading, updateTarotInterpretation } from "../../../db/tarot.repo";
import { drawThreeCards, type TarotCard } from "../../../lib/tarotDeck";
import { generateTarotInterpretation } from "../../../lib/tarotService";
import type { ChatSessionService } from "../../../lib/chatSessionService";

export interface TarotReadingState {
  cards: [TarotCard, TarotCard, TarotCard] | null;
  revealed: [boolean, boolean, boolean];
  allRevealed: boolean;
  generatingInterpretation: boolean;
  handleReveal: (index: 0 | 1 | 2) => void;
  loading: boolean;
}

export function useTarotReading(
  serviceRef: React.MutableRefObject<ChatSessionService | null>,
  refreshMessages: () => Promise<void>
): TarotReadingState {
  const [cards, setCards] = useState<[TarotCard, TarotCard, TarotCard] | null>(null);
  const [revealed, setRevealed] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [generatingInterpretation, setGeneratingInterpretation] = useState(false);
  const [loading, setLoading] = useState(true);
  const readingIdRef = useRef<number | null>(null);
  const interpretationDoneRef = useRef(false);

  useEffect(() => {
    const drawn = drawThreeCards();
    setCards(drawn);
    setRevealed([false, false, false]);
    setLoading(false);
  }, []);

  const handleReveal = async (index: 0 | 1 | 2) => {
    if (!cards || revealed[index]) return;

    const next: [boolean, boolean, boolean] = [...revealed] as [boolean, boolean, boolean];
    next[index] = true;
    setRevealed(next);

    const allDone = next[0] && next[1] && next[2];
    if (!allDone || interpretationDoneRef.current) return;

    // All 3 revealed for the first time — save + interpret
    interpretationDoneRef.current = true;
    setGeneratingInterpretation(true);

    try {
      const sessionId = serviceRef.current?.getSessionId() ?? undefined;
      const id = await saveTarotReading(cards[0].id, cards[1].id, cards[2].id, sessionId ?? undefined);
      readingIdRef.current = id;

      const interpretation = await generateTarotInterpretation(
        cards[0].name,
        cards[1].name,
        cards[2].name
      );

      await updateTarotInterpretation(id, interpretation);

      const service = serviceRef.current;
      if (service) {
        // Anchor follow-up messages to the drawn cards so the AI doesn't go off-topic
        const isTr = (await import("../../../lib/i18n")).default.language === "tr";
        const cardContext = isTr
          ? `Sen Lunara, sıcak ve sezgisel bir tarot okuyucususun. Bu seans için çekilen kartlar:\n\nGEÇMİŞ: ${cards[0].name}\nBUGÜN: ${cards[1].name}\nGELECEK: ${cards[2].name}\n\nHer takip mesajında bu üç karta atıfla yanıt ver. Güvenilir bir arkadaş gibi konuş — samimi, doğal, resmi değil. 2-3 cümle, sıcak ve doğrudan. Sohbeti sürdürmek için kısa bir soru sor. Liste veya başlık kullanma. YASAK: "evren sana mesaj veriyor", "kucakla", "yolculuğun". Her zaman Türkçe yanıt ver.`
          : `You are Lunara, a warm and intuitive tarot reader. The three cards drawn for this session are:\n\nPAST: ${cards[0].name}\nTODAY: ${cards[1].name}\nFUTURE: ${cards[2].name}\n\nFor every follow-up message, relate your answer back to these three cards. Speak like a trusted friend — conversational, intimate, never formal. 2-3 sentences, warm and direct. Ask one short question to keep the conversation going. No lists or headers. FORBIDDEN: 'the universe has a message', 'embrace', 'your journey'. Never be vague.`;
        service.setSystemText(cardContext);
        await service.addAssistantMessage(interpretation);
        await refreshMessages();
      }
    } catch (e) {
      console.error("[useTarotReading] interpretation error:", e);
    } finally {
      setGeneratingInterpretation(false);
    }
  };

  return {
    cards,
    revealed,
    allRevealed: revealed[0] && revealed[1] && revealed[2],
    generatingInterpretation,
    handleReveal,
    loading,
  };
}
