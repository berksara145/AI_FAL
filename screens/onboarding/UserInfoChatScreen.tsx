import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import BasicChatUI, { type ChatMessage } from "../../components/BasicChatUI";
import { INITIAL_MESSAGE } from "./constants";
import { useOnboardingState } from "./hooks/useOnboardingState";
import { useStreamingAction } from "./hooks/useStreamingAction";
import { useInitialMessageStreaming, markMessageDone as markMessageDoneStreaming } from "./hooks/useMessageStreaming";
import { handleNameCollection } from "./handlers/nameHandler";
import { handleDateConfirmation } from "./handlers/dateHandler";
import BirthDatePicker from "./components/BirthDatePicker";

export default function UserInfoChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: INITIAL_MESSAGE,
      isStreaming: true,
    },
  ]);

  const {
    nameCollected,
    setNameCollected,
    currentStep,
    setCurrentStep,
    showDatePicker,
    setShowDatePicker,
    birthDateState,
    setBirthDateState,
  } = useOnboardingState();

  const { setPendingAction, executeAction } = useStreamingAction();
  useInitialMessageStreaming(setMessages, "1", INITIAL_MESSAGE);

  const handleStreamingComplete = (messageId: string) => {
    executeAction(messageId);
    // Also mark message as done streaming in state
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      )
    );
  };

  const handleSendMessage = async (text: string): Promise<void> => {
    if (currentStep === "date") {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    if (currentStep === "name" && !nameCollected) {
      await handleNameCollection({
        text,
        setMessages,
        setNameCollected,
        setCurrentStep,
        setPendingAction: (messageId: string, action: () => void) => {
          setPendingAction(messageId, () => {
            setShowDatePicker(true);
            action();
          });
        },
        markMessageDone: (messageId: string, content: string) => {
          markMessageDoneStreaming(setMessages, messageId, content);
        },
      });
    }
  };

  const handleDateConfirm = async () => {
    await handleDateConfirmation({
      birthDateState,
      setMessages,
      setShowDatePicker,
      setCurrentStep,
      setPendingAction,
      navigation,
    });
  };

  const isStreaming = messages.some((msg) => msg.isStreaming === true);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#1a0d2e" }} edges={["top", "bottom"]}>
      <BasicChatUI
        title="About You"
        onSendMessage={handleSendMessage}
        messages={messages}
        disabled={showDatePicker || isStreaming}
        onStreamingComplete={handleStreamingComplete}
      />
      
      {showDatePicker && (
        <BirthDatePicker
          birthDateState={birthDateState}
          onDateChange={(updates) =>
            setBirthDateState((prev) => ({ ...prev, ...updates }))
          }
          onConfirm={handleDateConfirm}
        />
      )}
    </SafeAreaView>
  );
}
