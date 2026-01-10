import { useEffect } from "react";
import type { ChatMessage } from "../../../components/BasicChatUI";
import { STREAMING_SPEED_MS } from "../constants";
import { calculateStreamingDuration } from "../utils";

/**
 * Hook to manage initial message streaming
 */
export const useInitialMessageStreaming = (
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  messageId: string,
  content: string
) => {
  useEffect(() => {
    const streamingDuration = calculateStreamingDuration(content, STREAMING_SPEED_MS);
    const timer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isStreaming: false } : msg
        )
      );
    }, streamingDuration + 500); // Extra buffer for initial message
    return () => clearTimeout(timer);
  }, [messageId, content, setMessages]);
};

/**
 * Utility function to mark a message as done streaming
 * Adds significant buffer to ensure actual streaming completes before marking as done
 */
export const markMessageDone = (
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  messageId: string,
  content: string
) => {
  const baseStreamingDuration = calculateStreamingDuration(content, STREAMING_SPEED_MS);
  // Add 50% buffer + extra time for React rendering and timing variations
  const totalWaitTime = Math.ceil(baseStreamingDuration * 1.5) + 800;
  
  setTimeout(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      )
    );
  }, totalWaitTime);
};
