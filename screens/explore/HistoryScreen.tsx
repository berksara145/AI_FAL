import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  getRecentChatSessions,
  getFirstUserMessageContent,
} from "../../db/chat.repo";
import type { ChatSession } from "../../types/chatSession";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

function sessionLabel(session: ChatSession): string {
  if (session.title && session.title.trim()) return session.title.trim();
  if (session.feature && session.feature.trim()) return session.feature.trim();
  return "Chat";
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [firstUserMessageBySessionId, setFirstUserMessageBySessionId] = useState<
    Record<number, string | null>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await getRecentChatSessions(20);
        if (!cancelled) setSessions(list);
        if (cancelled || list.length === 0) {
          if (!cancelled) setFirstUserMessageBySessionId({});
          return;
        }
        const map: Record<number, string | null> = {};
        await Promise.all(
          list.map(async (s) => {
            const content = await getFirstUserMessageContent(s.id);
            if (!cancelled) map[s.id] = content;
          })
        );
        if (!cancelled) setFirstUserMessageBySessionId(map);
      } catch (e) {
        console.warn("HistoryScreen: failed to load sessions", e);
        if (!cancelled) {
          setSessions([]);
          setFirstUserMessageBySessionId({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Last 20 conversations</Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#e6b422" />
          </View>
        ) : sessions.length === 0 ? (
          <Text style={styles.empty}>No conversations yet</Text>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.itemWrap}>
              <View style={styles.rectangle}>
                <Pressable
                  style={({ pressed }) => [
                    styles.rectangleInner,
                    pressed && styles.rectanglePressed,
                  ]}
                  onPress={() => {
                    // TODO: open chat
                  }}
                >
                  <Text style={styles.rectangleTitle} numberOfLines={1}>
                    {sessionLabel(session)}
                  </Text>
                  <Text
                    style={styles.firstUserMessage}
                    numberOfLines={2}
                  >
                    {firstUserMessageBySessionId[session.id] ?? "—"}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.dateBelow}>
                {formatDate(session.updated_at || session.created_at)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0d2e",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 24,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  empty: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    marginTop: 20,
    paddingVertical: 16,
  },
  itemWrap: {
    marginBottom: 20,
  },
  rectangle: {
    width: "100%",
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(230, 180, 34, 0.5)",
    backgroundColor: "#1a0d2e",
    overflow: "hidden",
    paddingVertical: 6, // extra up/down padding on the outer rectangle
  },
  rectangleInner: {
    paddingVertical: 28, // increased vertical padding
    paddingHorizontal: 24,
    paddingLeft: 28,
  },
  rectanglePressed: {
    opacity: 0.85,
  },
  rectangleTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "rgba(220, 205, 150, 0.95)",
    paddingLeft: 12,
    paddingTop: 4,
  },
  firstUserMessage: {
    fontSize: 14,
    color: "rgba(210, 190, 120, 0.85)",
    paddingLeft: 12,
    paddingTop: 6,
    lineHeight: 20,
  },
  dateBelow: {
    fontSize: 12,
    color: "rgba(210, 190, 120, 0.75)",
    paddingLeft: 4,
  },
});
