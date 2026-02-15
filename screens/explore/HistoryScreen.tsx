import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { getRecentChatSessions } from "../../db/chat.repo";
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await getRecentChatSessions(20);
        if (!cancelled) setSessions(list);
      } catch (e) {
        console.warn("HistoryScreen: failed to load sessions", e);
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSession = (session: ChatSession) => {
    navigation.navigate("ChatSession", { sessionId: String(session.id) });
  };

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
            <ActivityIndicator size="large" color="#c9b4d4" />
          </View>
        ) : sessions.length === 0 ? (
          <Text style={styles.empty}>No conversations yet</Text>
        ) : (
          sessions.map((session) => (
            <Pressable
              key={session.id}
              style={({ pressed }) => [
                styles.box,
                pressed && styles.boxPressed,
              ]}
              onPress={() => openSession(session)}
            >
              <Text style={styles.boxTitle} numberOfLines={1}>
                {sessionLabel(session)}
              </Text>
              <Text style={styles.boxDate}>
                {formatDate(session.updated_at || session.created_at)}
              </Text>
            </Pressable>
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
    marginBottom: 20,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  empty: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    marginTop: 12,
  },
  box: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    backgroundColor: "rgba(201, 180, 212, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201, 180, 212, 0.25)",
  },
  boxPressed: {
    opacity: 0.85,
  },
  boxTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  boxDate: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },
});
