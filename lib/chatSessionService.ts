/**
 * ChatSessionService
 * Single class responsible for:
 * - Getting / giving messages (talks to DB)
 * - Sending to GPT with history rewriting (keeps content, limits token usage)
 * - Storing GPT system text (agenda)
 * - Initiating flows (e.g. user creation) via exposed methods
 */

import type { ChatMsg } from "./gptClient";
import { sendChatToOpenAI } from "./gptClient";
import {
  createChatSession,
  getChatSession,
  getMessagesBySession,
  addMessage,
} from "../db/chat.repo";
import type { ChatSession } from "../types/chatSession";
import type { Message } from "../types/message";

/** Message shape for UI (id, role, content, timestamp). */
export interface ChatSessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/** Options when creating or initializing the service. */
export interface ChatSessionServiceOptions {
  /** System prompt / agenda for GPT. */
  agenda: string;
  /** Feature label (e.g. "Today's Energy"). */
  feature?: string;
  /** Initial assistant message when session is created. */
  initialMessage?: string;
  /** Mode. */
  mode?: "interactive" | "readonly";
  /** Max number of history messages to send to GPT (rewrite: keep last N). */
  maxHistoryMessages?: number;
  /** When true, GPT can suggest saving a person to Orbit; reply may contain [SAVE_PERSON: Name]. */
  enableSavePersonHint?: boolean;
}

/** Result of sendMessage when enableSavePersonHint is true. */
export interface SendMessageResult {
  reply: string;
  /** Set when GPT suggested saving this person to Orbit (same chat, name + birth date flow). */
  suggestedSavePerson?: string;
}

const DEFAULT_AGENDA =
  "You are a warm, supportive assistant. Keep responses concise and helpful.";
const DEFAULT_MAX_HISTORY = 12;

const SAVE_PERSON_INSTRUCTION =
  "\n\nTwo-step save-to-Orbit flow:\n" +
  "1) When the user mentions a specific person they might want to save (e.g. by name), ask if they want to add them to Orbit. End your reply with exactly one line: [SAVE_PERSON: FirstName]. Use only the person's first name. Omit if they are not clearly referring to a specific person.\n" +
  "2) When the user then agrees (yes, sure, let's do it, etc.), reply briefly and positively, then end with exactly one line: [OPEN_SAVE_PERSON: FirstName]. Use the same first name. That line is for the system only and will not be shown. Omit if the user declined.";

/** Regex: tag at end of reply, optional newline/space before. Strip so no [SAVE_PERSON] / [OPEN_SAVE_PERSON] ever stored. */
const OPEN_SAVE_PERSON_RE = /\s*\[\s*OPEN_SAVE_PERSON\s*:\s*(.+?)\]\s*$/s;
const SAVE_PERSON_RE = /\s*\[\s*SAVE_PERSON\s*:\s*(.+?)\]\s*$/s;

/** Parse [SAVE_PERSON: Name] or [OPEN_SAVE_PERSON: Name]. Both tags are stripped from reply. OPEN = user affirmed, open form; that reply is never added to conversation. */
function parseSavePersonHint(reply: string): {
  reply: string;
  /** When set: user affirmed, open save form; this reply is not added to the conversation at all. */
  openSavePerson?: string;
} {
  let text = reply;
  // OPEN_SAVE_PERSON: strip tag, do not add this message to conversation
  const openMatch = text.match(OPEN_SAVE_PERSON_RE);
  if (openMatch) {
    const name = openMatch[1].trim();
    text = text.replace(OPEN_SAVE_PERSON_RE, "").trim();
    return { reply: text, openSavePerson: name || undefined };
  }
  // SAVE_PERSON: strip tag only, reply is added to conversation (without tag)
  const saveMatch = text.match(SAVE_PERSON_RE);
  if (saveMatch) {
    text = text.replace(SAVE_PERSON_RE, "").trim();
    return { reply: text };
  }
  return { reply: text.trim() };
}

function dbMessageToUI(msg: Message): ChatSessionMessage {
  return {
    id: msg.id.toString(),
    role: msg.role === "system" ? "assistant" : (msg.role as "user" | "assistant"),
    content: msg.content,
    timestamp: new Date(msg.timestamp),
  };
}

export class ChatSessionService {
  private sessionId: number | null = null;
  private session: ChatSession | null = null;
  private agenda: string;
  private feature: string | undefined;
  private initialMessage: string | undefined;
  private mode: "interactive" | "readonly";
  private maxHistoryMessages: number;
  private enableSavePersonHint: boolean;

  constructor(options: ChatSessionServiceOptions) {
    this.agenda = options.agenda || DEFAULT_AGENDA;
    this.feature = options.feature;
    this.initialMessage = options.initialMessage;
    this.mode = options.mode ?? "interactive";
    this.maxHistoryMessages = options.maxHistoryMessages ?? DEFAULT_MAX_HISTORY;
    this.enableSavePersonHint = options.enableSavePersonHint ?? false;
  }

  /** System text (agenda) used for GPT. */
  getSystemText(): string {
    return this.agenda;
  }

  setSystemText(agenda: string): void {
    this.agenda = agenda;
  }

  /** Current session id (null until session is created or loaded). */
  getSessionId(): number | null {
    return this.sessionId;
  }

  /** Current session (null until session is created or loaded). */
  getSession(): ChatSession | null {
    return this.session;
  }

  /**
   * Initialize or load session.
   * If sessionId is provided and exists, loads session and returns its messages.
   * Otherwise creates a new session, adds initial message, returns messages.
   */
  async initializeSession(existingSessionId?: number | null): Promise<{
    sessionId: number;
    session: ChatSession;
    messages: ChatSessionMessage[];
  }> {
    if (existingSessionId != null) {
      const session = await getChatSession(existingSessionId);
      if (session) {
        this.sessionId = session.id;
        this.session = session;
        const dbMessages = await getMessagesBySession(session.id);
        return {
          sessionId: session.id,
          session,
          messages: dbMessages.map(dbMessageToUI),
        };
      }
    }

    const session = await createChatSession({
      mode: this.mode,
      feature: this.feature,
      initialMessage: this.initialMessage,
    });
    this.sessionId = session.id;
    this.session = session;

    const content =
      this.initialMessage ??
      (this.feature
        ? `Welcome! Let's explore ${this.feature} together.`
        : "Hello! How can I help you today?");
    const dbMessage = await addMessage({
      sessionId: session.id,
      role: "assistant",
      content,
    });

    return {
      sessionId: session.id,
      session,
      messages: [dbMessageToUI(dbMessage)],
    };
  }

  /**
   * Get all messages for the current session from DB.
   */
  async getMessages(): Promise<ChatSessionMessage[]> {
    if (this.sessionId == null) return [];
    const dbMessages = await getMessagesBySession(this.sessionId);
    return dbMessages.map(dbMessageToUI);
  }

  /**
   * Build GPT payload: system + rewritten history (last N messages) + new user message.
   * When enableSavePersonHint, appends instruction so GPT can output [SAVE_PERSON: Name].
   */
  private buildMessagesForGpt(
    allMessages: ChatSessionMessage[],
    newUserContent: string
  ): ChatMsg[] {
    const history = allMessages.filter(
      (m) => m.role === "user" || m.role === "assistant"
    );
    const trimmed = history.slice(-this.maxHistoryMessages);
    const historyForGpt: ChatMsg[] = trimmed.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    const systemContent =
      this.enableSavePersonHint
        ? this.agenda + SAVE_PERSON_INSTRUCTION
        : this.agenda;
    return [
      { role: "system", content: systemContent },
      ...historyForGpt,
      { role: "user", content: newUserContent },
    ];
  }

  /**
   * Send user message: persist to DB, call GPT with rewritten history, persist reply.
   * When enableSavePersonHint, parses [SAVE_PERSON: Name] and returns suggestedSavePerson so the same chat can show the person-creation flow (name + birth date) without a new session.
   */
  async sendMessage(userContent: string): Promise<SendMessageResult> {
    if (this.sessionId == null) {
      throw new Error("ChatSessionService: no session. Call initializeSession first.");
    }
    const trimmed = userContent.trim();
    if (!trimmed) return { reply: "" };

    await addMessage({
      sessionId: this.sessionId,
      role: "user",
      content: trimmed,
    });

    const allMessages = await getMessagesBySession(this.sessionId);
    const uiMessages = allMessages.map(dbMessageToUI);
    const gptMessages = this.buildMessagesForGpt(uiMessages, trimmed);

    let rawReply: string;
    try {
      rawReply = await sendChatToOpenAI(gptMessages);
    } catch (err) {
      console.error("ChatSessionService: GPT error", err);
      rawReply =
        "I couldn't reach the AI right now. Please try again or check your connection.";
    }

    const parsed = this.enableSavePersonHint
      ? parseSavePersonHint(rawReply)
      : { reply: rawReply.trim(), openSavePerson: undefined as string | undefined };

    const { reply, openSavePerson } = parsed;

    // When user affirmed and GPT sent [OPEN_SAVE_PERSON]: do not add this reply to the conversation; just open the form.
    if (!openSavePerson) {
      await addMessage({
        sessionId: this.sessionId,
        role: "assistant",
        content: reply,
      });
    }

    return {
      reply: openSavePerson ? "" : reply,
      suggestedSavePerson: openSavePerson,
    };
  }

  /**
   * Hook for initiating other flows (e.g. user creation, save person).
   * Override or call from UI when needed.
   */
  async initiateUserCreation?(_params?: { name?: string }): Promise<void> {
    // Placeholder: e.g. open user onboarding or create person
  }
}
