import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createPersonMinimal, MAX_PERSONS } from "../../../db/person.repo";
import type { BirthDateState } from "../../onboarding/hooks/useOnboardingState";

type AppendMessage = (role: "user" | "assistant", content: string, streaming?: boolean) => Promise<any>;

export function useAddPersonFlow(
  appendMessage: AppendMessage,
  onDone: () => void
) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"name" | "birthDate" | "time">("name");
  const [collectedName, setCollectedName] = useState<string | null>(null);
  const [createdPersonName, setCreatedPersonName] = useState<string | null>(null);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [pendingTimePicker, setPendingTimePicker] = useState(false);

  const defaultYear = new Date().getFullYear() - 25;
  const [birthDateState, setBirthDateState] = useState<BirthDateState>({
    year: defaultYear,
    month: 1,
    day: 1,
  });

  const handleNameMessage = async (text: string) => {
    const name = text.trim();
    if (!name) return;

    await appendMessage("user", text);
    setCollectedName(name);
    setStep("birthDate");

    await appendMessage("assistant", t("birthMap.selectBirthDate", { name }), true);
    // Birth date picker opens after streaming completes (handled by onStreamingComplete)
  };

  const openBirthDatePicker = () => setShowBirthDatePicker(true);

  const handleBirthDateConfirm = async () => {
    if (!collectedName) return;
    const y = birthDateState.year ?? new Date().getFullYear();
    const m = birthDateState.month ?? 1;
    const d = birthDateState.day ?? 1;

    setShowBirthDatePicker(false);

    try {
      await createPersonMinimal({ name: collectedName, birth_year: y, birth_month: m, birth_day: d });
    } catch (e: any) {
      if (e?.message === "PERSON_LIMIT_REACHED") {
        await appendMessage(
          "assistant",
          t("birthMap.personLimitReached", { max: MAX_PERSONS })
        );
        return;
      }
      throw e;
    }

    setCreatedPersonName(collectedName);
    setStep("time");
    setPendingTimePicker(true);
    await appendMessage(
      "assistant",
      t("birthMap.timeQuestion", { name: collectedName }),
      true
    );
  };

  return {
    step,
    collectedName,
    createdPersonName,
    showBirthDatePicker,
    pendingTimePicker,
    clearPendingTimePicker: () => setPendingTimePicker(false),
    birthDateState,
    setBirthDateState,
    handleNameMessage,
    openBirthDatePicker,
    handleBirthDateConfirm,
  };
}
