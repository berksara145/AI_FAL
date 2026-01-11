// Chat session type definitions

export interface ChatSession {
  id: number;
  title: string | null;
  person_id: number | null;
  mode: "interactive" | "readonly";
  feature: string | null;
  initial_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateChatSessionParams {
  title?: string;
  mode?: "interactive" | "readonly";
  feature?: string;
  initialMessage?: string;
}