import { useState } from "react";
import { DATE_PICKER_CONFIG } from "../constants";

export type OnboardingStep = "name" | "date" | "complete";

export interface BirthDateState {
  year: number | null;
  month: number | null;
  day: number | null;
}

/**
 * Hook to manage onboarding state
 */
export const useOnboardingState = () => {
  const [nameCollected, setNameCollected] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("name");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDateState, setBirthDateState] = useState<BirthDateState>({
    year: new Date().getFullYear() - DATE_PICKER_CONFIG.DEFAULT_AGE,
    month: 1,
    day: 1,
  });

  return {
    nameCollected,
    setNameCollected,
    currentStep,
    setCurrentStep,
    showDatePicker,
    setShowDatePicker,
    birthDateState,
    setBirthDateState,
  };
};
