import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getRecentChatSessions,
  getLastMessages,
  getMessageCount,
} from "../../../db/chat.repo";
import { EXPLORE_CLASSES } from "../exploreClasses";
import type { ChatSession } from "../../../types/chatSession";
import type { Message } from "../../../types/message";

export type SessionWithMeta = ChatSession & {
  firstMessage: Message | null;
  messageCount: number;
};

export function useHistory() {
  const [sessions, setSessions] = useState<SessionWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const allowedFeatures = new Set(EXPLORE_CLASSES.map((c) => c.feature));
          const all = await getRecentChatSessions(40);
          const list = all.filter((s) => s.feature != null && allowedFeatures.has(s.feature));
          if (cancelled) return;
          const withMeta = await Promise.all(
            list.map(async (s) => {
              const msgs = await getLastMessages(s.id, 2);
              const first = msgs.find((m) => m.role !== "system") ?? null;
              return { ...s, firstMessage: first, messageCount: await getMessageCount(s.id) };
            })
          );
          if (!cancelled) setSessions(withMeta);
        } catch {
          if (!cancelled) setSessions([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  return { sessions, loading };
}
