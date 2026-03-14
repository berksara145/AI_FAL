import { useState, useEffect } from "react";
import {
  createChatSession,
  getChatSession,
  getMessagesBySession,
  addMessage,
} from "../../../db/chat.repo";
import type { Message } from "../../../types/message";
import type { ChatSession } from "../../../types/chatSession";
import type { ChatMessage } from "../../chat/components/ChatSessionCore";

const messageToUI = (msg: Message): ChatMessage => ({
  id: msg.id.toString(),
  role: msg.role === "system" ? "assistant" : msg.role,
  content: msg.content,
  timestamp: new Date(msg.timestamp),
});

type InitOptions = {
  sessionId?: number;
  isAddPersonFlow: boolean;
  personName?: string;
};

export function useChatSession({ sessionId, isAddPersonFlow, personName }: InitOptions) {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(
    sessionId ?? null
  );
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        if (currentSessionId) {
          const session = await getChatSession(currentSessionId);
          if (session) {
            setCurrentSession(session);
            const dbMessages = await getMessagesBySession(currentSessionId);
            setMessages(dbMessages.map(messageToUI));
            return;
          }
        }

        const firstMessage = isAddPersonFlow
          ? "Let's add someone to your orbit. What's their name?"
          : "To generate your birth map, I'll need a few details. First, what time were you born? Please provide the hour and minute.";

        const session = await createChatSession({
          mode: "interactive",
          feature: "birthMap",
          initialMessage: firstMessage,
        });

        setCurrentSessionId(session.id);
        setCurrentSession(session);

        const dbMessage = await addMessage({
          sessionId: session.id,
          role: "assistant",
          content: firstMessage,
        });
        const initial = messageToUI(dbMessage);
        initial.isStreaming = true;
        setMessages([initial]);
      } catch (error) {
        console.error("[useChatSession] init error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const appendMessage = async (role: "user" | "assistant", content: string, streaming = false) => {
    if (!currentSessionId) return null;
    const dbMessage = await addMessage({ sessionId: currentSessionId, role, content });
    const uiMessage = messageToUI(dbMessage);
    if (streaming) uiMessage.isStreaming = true;
    setMessages((prev) => [...prev, uiMessage]);
    return uiMessage;
  };

  return {
    currentSessionId,
    currentSession,
    messages,
    isLoading,
    setMessages,
    appendMessage,
  };
}
