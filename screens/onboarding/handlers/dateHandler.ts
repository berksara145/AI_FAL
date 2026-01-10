import type { ChatMessage } from "../../../components/BasicChatUI";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/RootStack";
import { updateBirthDate } from "../../../db/user.repo";
import { isValidDate } from "../utils";
import { MESSAGES, MONTH_NAMES_FULL } from "../constants";
import type { BirthDateState } from "../hooks/useOnboardingState";

interface HandleDateConfirmationParams {
  birthDateState: BirthDateState;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setShowDatePicker: (show: boolean) => void;
  setCurrentStep: (step: "name" | "date" | "complete") => void;
  setPendingAction: (messageId: string, action: () => void) => void;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const handleDateConfirmation = async ({
  birthDateState,
  setMessages,
  setShowDatePicker,
  setCurrentStep,
  setPendingAction,
  navigation,
}: HandleDateConfirmationParams): Promise<boolean> => {
  if (!birthDateState.year || !birthDateState.month || !birthDateState.day) {
    return false;
  }

  // Validate the date
  if (!isValidDate(birthDateState.year, birthDateState.month, birthDateState.day)) {
    const errorMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: errorMessageId,
        role: "assistant",
        content: MESSAGES.DATE_INVALID,
        isStreaming: false,
      },
    ]);
    return false;
  }

  try {
    await updateBirthDate(
      birthDateState.year,
      birthDateState.month,
      birthDateState.day
    );
    setShowDatePicker(false);
    setCurrentStep("complete");

    const aiMessageId = (Date.now() + 1).toString();
    const fullResponse = MESSAGES.DATE_SAVED(
      MONTH_NAMES_FULL[birthDateState.month - 1],
      birthDateState.day,
      birthDateState.year
    );

    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        role: "assistant",
        content: fullResponse,
        isStreaming: true,
      },
    ]);

    // Set up action to navigate when streaming completes
    setPendingAction(aiMessageId, () => {
      setTimeout(() => {
        try {
          navigation.replace("MainApp");
        } catch (error) {
          console.error("Error completing onboarding:", error);
          navigation.replace("MainApp");
        }
      }, 1000);
    });

    return true;
  } catch (error) {
    console.error("Error saving birth date:", error);
    const errorMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: errorMessageId,
        role: "assistant",
        content: MESSAGES.DATE_ERROR,
        isStreaming: false,
      },
    ]);
    return false;
  }
};
