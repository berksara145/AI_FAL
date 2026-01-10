import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
};

type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
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
      
      streamIntervalRef.current = setInterval(() => {
        // Always check the latest message content
        const latestFullText = messageContentRef.current;
        
        // Continue streaming letter by letter until complete
        if (currentIndexRef.current < latestFullText.length) {
          currentTextRef.current = latestFullText.substring(0, currentIndexRef.current + 1);
          setDisplayedText(currentTextRef.current);
          currentIndexRef.current++;
        } else {
          // Streaming complete - show full text
          setIsStreaming(false);
          setDisplayedText(latestFullText);
          currentTextRef.current = latestFullText;
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
        }
      }, 50); // Slower speed: higher = slower (was 30, now 50)
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

  return (
    <View
      style={{
        marginBottom: 24,
        width: "100%",
        paddingHorizontal: 24,
      }}
    >
      {/* Character Name - Theatre Script Style */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: "#d4af37",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontStyle: "italic",
        }}
      >
        {senderName}
      </Text>

      {/* Dialogue - Left Aligned Script Style */}
      <View>
        <Text
          style={{
            fontSize: 15,
            color: "#e5e5e5",
            lineHeight: 24,
            fontWeight: "300",
            letterSpacing: 0.3,
          }}
        >
          {displayedText}
          {isStreaming && (
            <Text style={{ color: "#d4af37" }}>▊</Text>
          )}
        </Text>
      </View>
    </View>
  );
}
