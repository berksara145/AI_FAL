import { useState, useEffect, useRef } from "react";
import { getTodayReading, saveTarotReading, updateTarotInterpretation } from "../../../db/tarot.repo";
import { drawThreeCards, getCardById, type TarotCard } from "../../../lib/tarotDeck";
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
    (async () => {
      try {
        const existing = await getTodayReading();
        if (existing) {
          // Already done today — restore card objects and show as revealed
          const past   = getCardById(existing.card_past);
          const today  = getCardById(existing.card_today);
          const future = getCardById(existing.card_future);
          if (past && today && future) {
            setCards([past, today, future]);
            setRevealed([true, true, true]);
            readingIdRef.current = existing.id;
            interpretationDoneRef.current = true;
          }
        } else {
          // Fresh draw for today
          const drawn = drawThreeCards();
          setCards(drawn);
          setRevealed([false, false, false]);
        }
      } finally {
        setLoading(false);
      }
    })();
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
      const id = await saveTarotReading(cards[0].id, cards[1].id, cards[2].id);
      readingIdRef.current = id;

      const interpretation = await generateTarotInterpretation(
        cards[0].name,
        cards[1].name,
        cards[2].name
      );

      await updateTarotInterpretation(id, interpretation);

      const service = serviceRef.current;
      if (service) {
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
