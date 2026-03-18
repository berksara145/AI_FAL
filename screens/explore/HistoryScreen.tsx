import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getRecentChatSessions,
  getLastMessages,
  getMessageCount,
} from "../../db/chat.repo";
import type { ChatSession } from "../../types/chatSession";
import type { Message } from "../../types/message";
import { Colors } from "../../utils/theme";

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function dateBucket(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = todayStart.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const days = Math.round(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return "This Week";
    if (days < 30) return "This Month";
    return "Older";
  } catch {
    return "Older";
  }
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function featureIcon(feature: string | null): IconName {
  if (!feature) return "chat-outline";
  const f = feature.toLowerCase();
  if (f.includes("tarot")) return "cards-playing-outline";
  if (f.includes("natal") || f.includes("birth chart") || f.includes("chart")) return "star-circle-outline";
  if (f.includes("someone") || f.includes("special")) return "heart-outline";
  if (f.includes("energy") || f.includes("today")) return "weather-sunny";
  if (f.includes("friend")) return "account-group-outline";
  if (f.includes("birthmap") || f.includes("birth map")) return "map-outline";
  return "chat-outline";
}

function featureColor(feature: string | null): string {
  if (!feature) return Colors.goldPrimary;
  const f = feature.toLowerCase();
  if (f.includes("tarot")) return Colors.pinkLight;
  if (f.includes("natal") || f.includes("chart")) return Colors.goldBright;
  if (f.includes("someone") || f.includes("special")) return Colors.pinkHot;
  if (f.includes("energy") || f.includes("today")) return Colors.skyBlue;
  if (f.includes("friend")) return Colors.goldLight;
  if (f.includes("birthmap") || f.includes("birth map")) return "#a78bfa";
  return Colors.goldPrimary;
}

function sessionLabel(session: ChatSession): string {
  if (session.title?.trim()) return session.title.trim();
  if (session.feature?.trim()) {
    const f = session.feature.trim();
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
  return "Chat";
}

type SessionWithMeta = ChatSession & {
  lastMessages: Message[];
  messageCount: number;
};

// ── section header ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={sectionStyles.row}>
      <View style={sectionStyles.line} />
      <Text style={sectionStyles.label}>{label}</Text>
      <View style={sectionStyles.line} />
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderGold,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textFaint,
    letterSpacing: 1.4,
    marginHorizontal: 10,
    textTransform: "uppercase",
  },
});

// ── chat card ─────────────────────────────────────────────────────────────────

function ChatCard({
  session,
  onPress,
}: {
  session: SessionWithMeta;
  onPress: () => void;
}) {
  const iconColor = featureColor(session.feature ?? null);
  const iconName = featureIcon(session.feature ?? null);
  const label = sessionLabel(session);
  const time = timeAgo(session.updated_at || session.created_at);
  const count = session.messageCount;

  const firstMessage = session.lastMessages.find((m) => m.role !== "system");

  return (
    <Pressable
      style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Top row: icon + title + meta */}
      <View style={styles.cardMeta}>
        <View style={[styles.iconCircle, { borderColor: iconColor + "66", backgroundColor: iconColor + "18" }]}>
          <MaterialCommunityIcons name={iconName} size={16} color={iconColor} />
        </View>
        <Text style={[styles.cardTitle, { color: iconColor }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.timeText}>{time}</Text>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
      </View>

      {/* Speech bubble */}
      <View style={styles.speechBubble}>
        <View style={styles.bubbleTail} />
        <Text style={styles.msgText} numberOfLines={3}>
          {firstMessage ? firstMessage.content : "No messages yet"}
        </Text>
      </View>
    </Pressable>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sessions, setSessions] = useState<SessionWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const list = await getRecentChatSessions(40);
          if (cancelled) return;
          const withMeta = await Promise.all(
            list.map(async (s) => ({
              ...s,
              lastMessages: await getLastMessages(s.id, 2),
              messageCount: await getMessageCount(s.id),
            }))
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

  const openSession = (session: SessionWithMeta) => {
    navigation.navigate("ChatSession", {
      sessionId: String(session.id),
      mode: "readonly",
      feature: session.feature ?? undefined,
    });
  };

  // Group sessions by date bucket
  const bucketOrder = ["Today", "Yesterday", "This Week", "This Month", "Older"];
  const bucketMap: Record<string, SessionWithMeta[]> = {};
  for (const s of sessions) {
    const b = dateBucket(s.updated_at || s.created_at);
    if (!bucketMap[b]) bucketMap[b] = [];
    bucketMap[b].push(s);
  }
  const grouped = bucketOrder
    .filter((b) => bucketMap[b]?.length)
    .map((b) => ({ bucket: b, items: bucketMap[b] }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgMain} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.goldPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.goldPrimary} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.centered}>
            <MaterialCommunityIcons name="chat-sleep-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start a chat from the Insights tab</Text>
          </View>
        ) : (
          grouped.map(({ bucket, items }) => (
            <View key={bucket}>
              <SectionHeader label={bucket} />
              {items.map((session) => (
                <React.Fragment key={session.id}>
                  <ChatCard
                    session={session}
                    onPress={() => openSession(session)}
                  />
                  <View style={{ height: 50 }} />
                </React.Fragment>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSide: {
    width: 36,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.goldPrimary,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 48,
  },
  centered: {
    paddingTop: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textFaint,
  },

  // ── Card wrapper ───────────────────────────────────────────────────────────
  cardWrapper: {
    gap: 8,
  },
  cardPressed: {
    opacity: 0.75,
  },

  // Top meta row (icon + title + time + count)
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textFaint,
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: Colors.goldPrimary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.bgMain,
  },

  // Big speech bubble
  speechBubble: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    padding: 14,
    gap: 10,
  },
  bubbleTail: {
    position: "absolute",
    top: -9,
    left: 14,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: Colors.borderGold,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
  },
});
