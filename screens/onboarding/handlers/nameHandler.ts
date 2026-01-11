import type { ChatMessage } from "../../../components/BasicChatUI";
import { updateUserName } from "../../../db/user.repo";
import { extractName } from "../utils";
import { MESSAGES } from "../constants";

interface HandleNameCollectionParams {
  text: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setNameCollected: (value: boolean) => void;
  setCurrentStep: (step: "name" | "date" | "complete") => void;
  setPendingAction: (messageId: string, action: () => void) => void;
  markMessageDone: (messageId: string, content: string) => void;
}

export const handleNameCollection = async ({
  text,
  setMessages,
  setNameCollected,
  setCurrentStep,
  setPendingAction,
  markMessageDone,
}: HandleNameCollectionParams): Promise<boolean> => {
  const extractedName = extractName(text);

  if (!extractedName) {
    // Name extraction failed, ask again
    const aiMessageId = (Date.now() + 1).toString();
    const fullResponse = MESSAGES.NAME_INVALID;

    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        role: "assistant",
        content: fullResponse,
        isStreaming: true,
      },
    ]);

    markMessageDone(aiMessageId, fullResponse);
    return false;
  }

  try {
    await updateUserName(extractedName);
    setNameCollected(true);
    setCurrentStep("date");

    // Generate AI response with the name and show date picker
    const aiMessageId = (Date.now() + 1).toString();
    const fullResponse = MESSAGES.NAME_COLLECTED(extractedName);

    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        role: "assistant",
        content: fullResponse,
        isStreaming: true,
      },
    ]);

    // Set up action to show date picker when streaming completes
    // Note: The actual action will be set by the parent component via the wrapper
    setPendingAction(aiMessageId, () => {
      // This will be set by the parent component
    });

    markMessageDone(aiMessageId, fullResponse);
    return true;
  } catch (error) {
    console.error("Error updating user name:", error);
    const errorMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: errorMessageId,
        role: "assistant",
        content: MESSAGES.NAME_ERROR,
        isStreaming: false,
      },
    ]);
    return false;
  }
};
