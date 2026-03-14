import { useState } from "react";
import { addMessage } from "../../../db/chat.repo";
import { createPersonMinimal, getPersonCount, isPersonNameTaken, MAX_PERSONS } from "../../../db/person.repo";
import type { BirthDateState } from "../../onboarding/hooks/useOnboardingState";

type RefreshMessages = () => Promise<void>;

export function useSavePersonFlow(getSessionId: () => number | null, refreshMessages: RefreshMessages) {
  const defaultYear = new Date().getFullYear() - 25;

  const [pendingSavePerson, setPendingSavePerson] = useState<string | null>(null);
  const [savePersonName, setSavePersonName] = useState("");
  const [savePersonError, setSavePersonError] = useState<string | null>(null);
  const [savePersonBirthDate, setSavePersonBirthDate] = useState<BirthDateState>({
    year: defaultYear,
    month: 1,
    day: 1,
  });

  const suggest = (name: string) => {
    setSavePersonName(name);
    setPendingSavePerson(name);
  };

  const handleConfirm = async () => {
    const sid = getSessionId();
    if (sid == null) return;

    const name = (savePersonName || pendingSavePerson || "").trim() || "Unknown";
    const count = await getPersonCount();
    if (count >= MAX_PERSONS) {
      setSavePersonError(`You've reached the maximum of ${MAX_PERSONS} people in your birth chart.`);
      return;
    }
    const taken = await isPersonNameTaken(name);
    if (taken) {
      setSavePersonError("This name is already in your birth chart. Please choose a unique name.");
      return;
    }

    setSavePersonError(null);
    const y = savePersonBirthDate.year ?? new Date().getFullYear();
    const m = savePersonBirthDate.month ?? 1;
    const d = savePersonBirthDate.day ?? 1;

    setPendingSavePerson(null);
    setSavePersonName("");
    setSavePersonBirthDate({ year: defaultYear, month: 1, day: 1 });

    try {
      await createPersonMinimal({ name, birth_year: y, birth_month: m, birth_day: d });
    } catch (e: any) {
      if (e?.message === "PERSON_LIMIT_REACHED") {
        setSavePersonError(`You've reached the maximum of ${MAX_PERSONS} people in your birth chart.`);
        return;
      }
      throw e;
    }

    await addMessage({ sessionId: sid, role: "assistant", content: `Added ${name} to your birth chart! ✨` });
    await refreshMessages();
  };

  const handleCancel = () => {
    setPendingSavePerson(null);
    setSavePersonName("");
    setSavePersonError(null);
  };

  return {
    pendingSavePerson,
    savePersonName,
    setSavePersonName: (t: string) => {
      setSavePersonName(t);
      if (savePersonError) setSavePersonError(null);
    },
    savePersonError,
    savePersonBirthDate,
    setSavePersonBirthDate,
    suggest,
    handleConfirm,
    handleCancel,
  };
}
