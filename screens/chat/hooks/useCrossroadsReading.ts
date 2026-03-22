import { useState, useRef } from "react";
import { addMessage } from "../../../db/chat.repo";
import {
  drawDailyCrossroadsCard,
  resolveTarotCard,
  type CrossroadsCard,
} from "../../../lib/cosmicCrossroads";
import { generateCrossroadsReading } from "../../../lib/cosmicCrossroadsService";
import type { TarotCard } from "../../../lib/tarotDeck";
import type { ChatSessionService } from "../../../lib/chatSessionService";

export interface CrossroadsState {
  card: CrossroadsCard;
  tarotCard: TarotCard | undefined;
  revealed: boolean;
  generating: boolean;
  markDone: () => void;
  handleQuestion: (
    question: string,
    service: ChatSessionService,
    refreshMessages: () => Promise<void>
  ) => Promise<void>;
}

export function useCrossroadsReading(): CrossroadsState {
  // Stable all day — no useState needed, drawDailyCrossroadsCard is deterministic
  const cardRef = useRef(drawDailyCrossroadsCard());
  const card = cardRef.current;
  const tarotCard = resolveTarotCard(card);

  const [revealed, setRevealed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const handledRef = useRef(false);

  const markDone = () => setRevealed(true);

  const handleQuestion = async (
    question: string,
    service: ChatSessionService,
    refreshMessages: () => Promise<void>
  ) => {
    if (handledRef.current) return;
    handledRef.current = true;

    const sessionId = service.getSessionId();
    if (!sessionId) return;

    await addMessage({ sessionId, role: "user", content: question });
    setRevealed(true);
    setGenerating(true);

    try {
      const reading = await generateCrossroadsReading(card, question);
      await service.addAssistantMessage(reading);
      await refreshMessages();
    } catch (e) {
      console.error("[useCrossroadsReading] error:", e);
    } finally {
      setGenerating(false);
    }
  };

  return { card, tarotCard, revealed, generating, markDone, handleQuestion };
}
