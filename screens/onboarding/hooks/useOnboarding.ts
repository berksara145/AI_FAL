import { useState, useCallback, useRef } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/RootStack";
import { updateUserName, updateBirthDate, completeOnboarding } from "../../../db/user.repo";
import { upsertSelfPersonFromCurrentUser } from "../../../db/person.repo";
import { extractName, isValidDate } from "../utils";
import { MESSAGES, MONTH_NAMES_FULL, DATE_PICKER_CONFIG } from "../constants";
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
  // Map of messageId → callback to run when that message finishes streaming
  const streamCallbacksRef = useRef<Record<string, () => void>>({});

  const onMessageStreamingComplete = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)));
    const cb = streamCallbacksRef.current[id];
    if (cb) {
      delete streamCallbacksRef.current[id];
      cb();
    }
  }, [setMessages]);

  const handleNameMessage = useCallback(async (text: string) => {
    if (step !== "name") return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const name = extractName(text);

    if (!name) {
      const msg = makeAiMessage(MESSAGES.NAME_INVALID);
      setMessages((prev) => [...prev, msg]);
      return;
    }

    try {
      await updateUserName(name);
      setStep("date");

      const msg = makeAiMessage(MESSAGES.NAME_COLLECTED(name));
      streamCallbacksRef.current[msg.id] = () => setShowDatePicker(true);
      setMessages((prev) => [...prev, msg]);
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
      streamCallbacksRef.current[msg.id] = async () => {
        try {
          await completeOnboarding();
          await upsertSelfPersonFromCurrentUser();
        } catch (e) {
          console.error("[useOnboarding] finalize error:", e);
        }
        navigation.replace("MainApp");
      };
      setMessages((prev) => [...prev, msg]);
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
    onMessageStreamingComplete,
  };
}
