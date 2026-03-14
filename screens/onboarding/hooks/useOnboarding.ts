import { useState, useCallback } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/RootStack";
import { updateUserName, updateBirthDate, completeOnboarding } from "../../../db/user.repo";
import { upsertSelfPersonFromCurrentUser } from "../../../db/person.repo";
import { extractName, isValidDate, calculateStreamingDuration } from "../utils";
import { MESSAGES, MONTH_NAMES_FULL, DATE_PICKER_CONFIG, STREAMING_SPEED_MS } from "../constants";
import type { ChatMessage } from "../../../components/BasicChatUI";

export type OnboardingStep = "name" | "date" | "complete";

export interface BirthDateState {
  year: number | null;
  month: number | null;
  day: number | null;
}

function makeAiMessage(content: string, streaming = true): ChatMessage {
  return { id: (Date.now() + 1).toString(), role: "assistant", content, isStreaming: streaming };
}

/** Schedule a message to finish streaming after its natural duration. */
function scheduleStreamingDone(
  messageId: string,
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  onDone?: () => void
) {
  const duration = Math.ceil(calculateStreamingDuration(content, STREAMING_SPEED_MS) * 1.5) + 800;
  setTimeout(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isStreaming: false } : m))
    );
    onDone?.();
  }, duration);
}

export function useOnboarding(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
  const [step, setStep] = useState<OnboardingStep>("name");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDateState, setBirthDateState] = useState<BirthDateState>({
    year: new Date().getFullYear() - DATE_PICKER_CONFIG.DEFAULT_AGE,
    month: 1,
    day: 1,
  });

  const handleNameMessage = useCallback(async (text: string) => {
    if (step !== "name") return;

    const name = extractName(text);

    if (!name) {
      const msg = makeAiMessage(MESSAGES.NAME_INVALID);
      setMessages((prev) => [...prev, msg]);
      scheduleStreamingDone(msg.id, msg.content, setMessages);
      return;
    }

    try {
      await updateUserName(name);
      setStep("date");

      const msg = makeAiMessage(MESSAGES.NAME_COLLECTED(name));
      setMessages((prev) => [...prev, msg]);
      scheduleStreamingDone(msg.id, msg.content, setMessages, () => {
        setShowDatePicker(true);
      });
    } catch {
      const msg = makeAiMessage(MESSAGES.NAME_ERROR, false);
      setMessages((prev) => [...prev, msg]);
    }
  }, [step, setMessages]);

  const handleDateConfirm = useCallback(async () => {
    const { year, month, day } = birthDateState;
    if (!year || !month || !day) return;

    if (!isValidDate(year, month, day)) {
      const msg = makeAiMessage(MESSAGES.DATE_INVALID, false);
      setMessages((prev) => [...prev, msg]);
      return;
    }

    try {
      await updateBirthDate(year, month, day);
      setShowDatePicker(false);
      setStep("complete");

      const content = MESSAGES.DATE_SAVED(MONTH_NAMES_FULL[month - 1], day, year);
      const msg = makeAiMessage(content);
      setMessages((prev) => [...prev, msg]);

      scheduleStreamingDone(msg.id, content, setMessages, async () => {
        try {
          await completeOnboarding();
          await upsertSelfPersonFromCurrentUser();
        } catch (e) {
          console.error("[useOnboarding] finalize error:", e);
        }
        setTimeout(() => navigation.replace("MainApp"), 1000);
      });
    } catch {
      const msg = makeAiMessage(MESSAGES.DATE_ERROR, false);
      setMessages((prev) => [...prev, msg]);
    }
  }, [birthDateState, navigation, setMessages]);

  return {
    step,
    showDatePicker,
    birthDateState,
    setBirthDateState,
    handleNameMessage,
    handleDateConfirm,
  };
}
