// Message type definitions

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: number;
  session_id: number;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface CreateMessageParams {
  sessionId: number;
  role: MessageRole;
  content: string;
  timestamp?: Date;
}