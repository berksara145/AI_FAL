import { executeSql, querySql, initDatabase } from "./database";
import type { ChatSession, CreateChatSessionParams } from "../types/chatSession";
import type { Message, CreateMessageParams } from "../types/message";

// Initialize database on first import
let dbInitialized = false;

const ensureDatabaseInitialized = async (): Promise<void> => {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
};

/**
 * Create a new chat session
 */
export const createChatSession = async (
  params: CreateChatSessionParams
): Promise<ChatSession> => {
  await ensureDatabaseInitialized();

  try {
    const { title, mode = "interactive", feature, initialMessage } = params;

    // person_id is always null since this is a local single-user database
    const insertResult = await executeSql(
      `INSERT INTO chat_sessions (title, person_id, mode, feature, initial_message, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [title || null, null, mode, feature || null, initialMessage || null]
    );

    const newSessions = await querySql<ChatSession>(
      "SELECT * FROM chat_sessions WHERE id = ?",
      [insertResult.lastInsertRowId]
    );

    if (newSessions.length > 0) {
      console.log("New chat session created:", newSessions[0]);
      return newSessions[0];
    } else {
      throw new Error("Failed to create chat session");
    }
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

/**
 * Get a chat session by ID
 */
export const getChatSession = async (sessionId: number): Promise<ChatSession | null> => {
  await ensureDatabaseInitialized();

  try {
    const sessions = await querySql<ChatSession>(
      "SELECT * FROM chat_sessions WHERE id = ?",
      [sessionId]
    );
    return sessions.length > 0 ? sessions[0] : null;
  } catch (error) {
    console.error("Error getting chat session:", error);
    return null;
  }
};

/**
 * Get all chat sessions, ordered by most recent first
 */
export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  await ensureDatabaseInitialized();

  try {
    const sessions = await querySql<ChatSession>(
      "SELECT * FROM chat_sessions ORDER BY updated_at DESC"
    );
    return sessions;
  } catch (error) {
    console.error("Error getting all chat sessions:", error);
    return [];
  }
};

/**
 * Get chat sessions by person ID
 * Note: Since this is a local single-user database, this is equivalent to getAllChatSessions
 * @deprecated Use getAllChatSessions() instead
 */
export const getChatSessionsByPerson = async (personId: number): Promise<ChatSession[]> => {
  // Since there's only one person, just return all sessions
  return getAllChatSessions();
};

/**
 * Update chat session's updated_at timestamp
 */
export const updateChatSessionTimestamp = async (sessionId: number): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    await executeSql(
      "UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?",
      [sessionId]
    );
  } catch (error) {
    console.error("Error updating chat session timestamp:", error);
    throw error;
  }
};

/**
 * Update chat session title
 */
export const updateChatSessionTitle = async (
  sessionId: number,
  title: string
): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    await executeSql(
      "UPDATE chat_sessions SET title = ?, updated_at = datetime('now') WHERE id = ?",
      [title, sessionId]
    );
  } catch (error) {
    console.error("Error updating chat session title:", error);
    throw error;
  }
};

/**
 * Delete a chat session (cascades to messages)
 */
export const deleteChatSession = async (sessionId: number): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    await executeSql("DELETE FROM chat_sessions WHERE id = ?", [sessionId]);
    console.log("Chat session deleted:", sessionId);
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
};

/**
 * Add a message to a chat session
 */
export const addMessage = async (params: CreateMessageParams): Promise<Message> => {
  await ensureDatabaseInitialized();

  try {
    const { sessionId, role, content, timestamp } = params;
    const timestampStr = timestamp ? timestamp.toISOString() : new Date().toISOString();

    const insertResult = await executeSql(
      `INSERT INTO messages (session_id, role, content, timestamp)
       VALUES (?, ?, ?, ?)`,
      [sessionId, role, content, timestampStr]
    );

    // Update session's updated_at timestamp
    await updateChatSessionTimestamp(sessionId);

    const newMessages = await querySql<Message>(
      "SELECT * FROM messages WHERE id = ?",
      [insertResult.lastInsertRowId]
    );

    if (newMessages.length > 0) {
      console.log("New message added:", newMessages[0]);
      return newMessages[0];
    } else {
      throw new Error("Failed to create message");
    }
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};

/**
 * Get all messages for a chat session, ordered by timestamp
 */
export const getMessagesBySession = async (sessionId: number): Promise<Message[]> => {
  await ensureDatabaseInitialized();

  try {
    const messages = await querySql<Message>(
      "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC",
      [sessionId]
    );
    return messages;
  } catch (error) {
    console.error("Error getting messages by session:", error);
    return [];
  }
};

/**
 * Get the last N messages for a chat session
 */
export const getLastMessages = async (
  sessionId: number,
  limit: number = 10
): Promise<Message[]> => {
  await ensureDatabaseInitialized();

  try {
    const messages = await querySql<Message>(
      "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?",
      [sessionId, limit]
    );
    return messages.reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error("Error getting last messages:", error);
    return [];
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: number): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    await executeSql("DELETE FROM messages WHERE id = ?", [messageId]);
    console.log("Message deleted:", messageId);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
