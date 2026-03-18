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
  staticDisplay?: boolean;
  /** Show hairline divider above this message */
  showDivider?: boolean;
};

export default function MessageBubble({
  message,
  onStreamingComplete,
  staticDisplay,
  showDivider,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  const [displayedText, setDisplayedText] = useState(staticDisplay ? message.content : "");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);
  const messageIdRef = useRef(message.id);
  const contentRef = useRef(message.content);
  const indexRef = useRef(0);

  useEffect(() => {
    contentRef.current = message.content;

    if (messageIdRef.current !== message.id) {
      hasStartedRef.current = false;
      messageIdRef.current = message.id;
      indexRef.current = 0;
      if (streamIntervalRef.current) { clearInterval(streamIntervalRef.current); streamIntervalRef.current = null; }
    }

    if (isUser || staticDisplay) {
      setDisplayedText(message.content);
      setIsStreaming(false);
      return;
    }

    if (message.content && !hasStartedRef.current && !streamIntervalRef.current) {
      setIsStreaming(true);
      hasStartedRef.current = true;
      indexRef.current = 0;
      const charsPerTick = Math.max(1, Math.ceil(message.content.length / 150));
      streamIntervalRef.current = setInterval(() => {
        const full = contentRef.current;
        if (indexRef.current < full.length) {
          indexRef.current = Math.min(indexRef.current + charsPerTick, full.length);
          setDisplayedText(full.substring(0, indexRef.current));
        } else {
          setIsStreaming(false);
          setDisplayedText(full);
          clearInterval(streamIntervalRef.current!);
          streamIntervalRef.current = null;
          onStreamingComplete?.(messageIdRef.current);
        }
      }, 10);
    } else if (!message.isStreaming && message.content && !hasStartedRef.current && !streamIntervalRef.current) {
      setDisplayedText(message.content);
      setIsStreaming(false);
      indexRef.current = message.content.length;
    }

    return () => {
      if (messageIdRef.current !== message.id && streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    };
  }, [message.id, isUser]);

  return (
    <View style={{ paddingBottom: 26 }}>

      {/* Hairline between every message — fades left to right */}
      {showDivider && (
        <View style={{
          height: 1,
          marginBottom: 26,
          marginTop: -12,
          backgroundColor: ChatColors.divider,
        }} />
      )}

      {/* Sender row: dot + label */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <View style={{
          width: 6, height: 6, borderRadius: 3, flexShrink: 0,
          backgroundColor: isUser ? ChatColors.userDot : ChatColors.sendActive,
          shadowColor: isUser ? "transparent" : "#c9a84c",
          shadowOpacity: isUser ? 0 : 0.7,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        }} />
        <Text style={{
          fontSize: 11.5,
          fontWeight: "600",
          letterSpacing: 1.8,
          textTransform: "uppercase",
          color: isUser ? ChatColors.userLabel : ChatColors.lunaraLabel,
        }}>
          {isUser ? "You" : "Lunara"}
        </Text>
      </View>

      {/* Message text */}
      {isUser ? (
        <Text style={{
          fontSize: 16,
          fontWeight: "500",
          lineHeight: 27,
          color: ChatColors.userText,
          paddingLeft: 13,
          letterSpacing: 0.1,
        }}>
          {displayedText}
        </Text>
      ) : (
        <View style={{
          borderLeftWidth: 2,
          borderLeftColor: ChatColors.lunaraBorder,
          paddingLeft: 13,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: "400",
            lineHeight: 27,
            color: ChatColors.lunaraText,
            letterSpacing: 0.1,
          }}>
            {displayedText}
            {isStreaming && (
              <Text style={{ color: ChatColors.streamCursor }}>▊</Text>
            )}
          </Text>
        </View>
      )}
    </View>
  );
}
