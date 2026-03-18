import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { ChatColors } from "../../../utils/theme";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
};

type MessageBubbleProps = {
  message: Message;
  onStreamingComplete?: (messageId: string) => void;
};

export default function MessageBubble({ message, onStreamingComplete }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const senderName = isUser ? "You" : "LUNARA";
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedStreamingRef = useRef(false);
  const messageIdRef = useRef<string>(message.id);
  const currentTextRef = useRef<string>("");
  const messageContentRef = useRef<string>(message.content);
  const currentIndexRef = useRef<number>(0);

  useEffect(() => {
    // Update message content ref (always keep it updated)
    messageContentRef.current = message.content;
    
    // Reset streaming state when message ID changes
    if (messageIdRef.current !== message.id) {
      hasStartedStreamingRef.current = false;
      messageIdRef.current = message.id;
      currentIndexRef.current = 0;
      currentTextRef.current = "";
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    }

    // For user messages, show immediately
    if (isUser) {
      setDisplayedText(message.content);
      setIsStreaming(false);
      return;
    }

    // For assistant messages - stream letter by letter
    if (message.content && !hasStartedStreamingRef.current && streamIntervalRef.current === null) {
      // Start streaming
      setIsStreaming(true);
      hasStartedStreamingRef.current = true;
      currentTextRef.current = "";
      currentIndexRef.current = 0;

      // Fixed 10ms tick; chars per tick scales so any message finishes in ~1.5s
      const totalLen = message.content.length;
      const charsPerTick = Math.max(1, Math.ceil(totalLen / 150));
      const intervalMs = 10;

      streamIntervalRef.current = setInterval(() => {
        // Always check the latest message content
        const latestFullText = messageContentRef.current;

        // Continue streaming until complete
        if (currentIndexRef.current < latestFullText.length) {
          currentIndexRef.current = Math.min(currentIndexRef.current + charsPerTick, latestFullText.length);
          currentTextRef.current = latestFullText.substring(0, currentIndexRef.current);
          setDisplayedText(currentTextRef.current);
        } else {
          // Streaming complete - show full text
          setIsStreaming(false);
          setDisplayedText(latestFullText);
          currentTextRef.current = latestFullText;
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
          // Notify parent that streaming is complete
          onStreamingComplete?.(messageIdRef.current);
        }
      }, intervalMs);
    } else if (!message.isStreaming && message.content && !hasStartedStreamingRef.current && streamIntervalRef.current === null) {
      // Message was added without streaming, show full content immediately
      setDisplayedText(message.content);
      setIsStreaming(false);
      currentTextRef.current = message.content;
      currentIndexRef.current = message.content.length;
    }

    // Cleanup on unmount or when message ID changes
    return () => {
      // Only cleanup if message ID changed (handled above) or component unmounts
      // Don't cleanup if content just updated during streaming
      if (messageIdRef.current !== message.id) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
      }
    };
  }, [message.id, isUser]); // Removed message.content and message.isStreaming from dependencies

  if (isUser) {
    return (
      <View
        style={{
          marginBottom: 32,
          width: "100%",
          paddingHorizontal: 24,
          alignItems: "flex-end",
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: "500",
            color: ChatColors.userLabel,
            marginBottom: 5,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            fontStyle: "italic",
          }}
        >
          {senderName}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: ChatColors.userText,
            lineHeight: 24,
            fontWeight: "400",
            letterSpacing: 0.3,
            textAlign: "right",
          }}
        >
          {displayedText}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        marginBottom: 32,
        width: "100%",
        paddingLeft: 20,
        paddingRight: 24,
        borderLeftWidth: 2,
        borderLeftColor: ChatColors.lunaraBorder,
      }}
    >
      {/* LUNARA label */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: ChatColors.lunaraLabel,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 2,
          fontStyle: "italic",
        }}
      >
        {senderName}
      </Text>

      {/* Dialogue */}
      <Text
        style={{
          fontSize: 16,
          color: ChatColors.lunaraText,
          lineHeight: 26,
          fontWeight: "300",
          letterSpacing: 0.3,
        }}
      >
        {displayedText}
        {isStreaming && (
          <Text style={{ color: ChatColors.streamCursor }}>▊</Text>
        )}
      </Text>
    </View>
  );
}
