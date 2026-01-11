// Chat hook - provides chat functionality with database integration

import { useState, useCallback } from "react";
import {
  createChatSession,
  getChatSession,
  getMessagesBySession,
  addMessage,
  getAllChatSessions,
  deleteChatSession,
} from "../db/chat.repo";
import type { ChatSession, CreateChatSessionParams } from "../types/chatSession";
import type { Message, CreateMessageParams } from "../types/message";

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a new chat session
   */
  const createSession = useCallback(async (params: CreateChatSessionParams): Promise<ChatSession | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await createChatSession(params);
      return session;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create chat session");
      setError(error);
      console.error("Error creating chat session:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get a chat session by ID
   */
  const getSession = useCallback(async (sessionId: number): Promise<ChatSession | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await getChatSession(sessionId);
      return session;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get chat session");
      setError(error);
      console.error("Error getting chat session:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all chat sessions
   */
  const getAllSessions = useCallback(async (): Promise<ChatSession[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const sessions = await getAllChatSessions();
      return sessions;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get chat sessions");
      setError(error);
      console.error("Error getting chat sessions:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get messages for a session
   */
  const getMessages = useCallback(async (sessionId: number): Promise<Message[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const messages = await getMessagesBySession(sessionId);
      return messages;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get messages");
      setError(error);
      console.error("Error getting messages:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send a message (add to database)
   */
  const sendMessage = useCallback(async (params: CreateMessageParams): Promise<Message | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const message = await addMessage(params);
      return message;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to send message");
      setError(error);
      console.error("Error sending message:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a chat session
   */
  const deleteSession = useCallback(async (sessionId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteChatSession(sessionId);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete chat session");
      setError(error);
      console.error("Error deleting chat session:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createSession,
    getSession,
    getAllSessions,
    getMessages,
    sendMessage,
    deleteSession,
    isLoading,
    error,
  };
};
