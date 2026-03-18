import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import BasicChatUI, { type ChatMessage } from "../../components/BasicChatUI";
import BirthDatePicker from "./components/BirthDatePicker";
import { useOnboarding } from "./hooks/useOnboarding";
import { INITIAL_MESSAGE } from "./constants";

export default function UserInfoChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "assistant", content: INITIAL_MESSAGE, isStreaming: true },
  ]);

  const {
    step,
    showDatePicker,
    birthDateState,
    setBirthDateState,
    handleNameMessage,
    handleDateConfirm,
    onMessageStreamingComplete,
  } = useOnboarding(navigation, setMessages);

  const isStreaming = messages.some((m) => m.isStreaming);

  return (
    <View className="flex-1">
      <BasicChatUI
        title="About You"
        messages={messages}
        onSendMessage={handleNameMessage}
        disabled={showDatePicker || isStreaming || step === "date"}
        onStreamingComplete={onMessageStreamingComplete}
      />

      {showDatePicker && (
        <BirthDatePicker
          birthDateState={birthDateState}
          onDateChange={(updates) => setBirthDateState((prev) => ({ ...prev, ...updates }))}
          onConfirm={handleDateConfirm}
        />
      )}
    </View>
  );
}
