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
import { EXPLORE_CLASSES } from "./exploreClasses";
import type { ChatSession } from "../../types/chatSession";
import type { Message } from "../../types/message";
import { ChatColors } from "../../utils/theme";
import { useTranslation } from "react-i18next";

// ── Design tokens — mirror exact chat theme ───────────────────────────────────
const C = {
  navy:       ChatColors.headerBg,      // #120c28
  gold:       ChatColors.sendActive,    // #c9a84c
  deepPurple: "#2d1f5e",
  bg:         ChatColors.bg,            // #cfc0a3
  bgCard:     ChatColors.inputBarBg,    // #c4b597
  surface:    ChatColors.inputFieldBg,  // #b8a98a
  border:     ChatColors.border,        // rgba(100,80,40,0.18)
  textDark:   ChatColors.lunaraText,    // #0f0920
  textMid:    ChatColors.userText,      // #221550
  textMuted:  ChatColors.userLabel,     // #5a4a78
  goldLabel:  ChatColors.lunaraLabel,   // #7a5810
  lavender:   ChatColors.userDot,       // #9b8cc8
  bubbleAiBg: "#2d1f5e",
  bubbleAiTx: "#f5e9c8",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

type TFn = (key: string, opts?: Record<string, unknown>) => string;

function timeAgo(iso: string, t: TFn): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("history.justNow");
    if (mins < 60) return t("history.minutesAgo", { n: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("history.hoursAgo", { n: hrs });
    const days = Math.floor(hrs / 24);
    if (days < 7) return t("history.daysAgo", { n: days });
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function dateBucket(iso: string): string {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = todayStart.getTime() - new Date(new Date(iso).getFullYear(), new Date(iso).getMonth(), new Date(iso).getDate()).getTime();
    const days = Math.round(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return "This Week";
    if (days < 30) return "This Month";
    return "Older";
  } catch { return "Older"; }
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function featureIcon(feature: string | null): IconName {
  if (!feature) return "chat-outline";
  const f = feature.toLowerCase();
  if (f.includes("tarot")) return "cards-playing-outline";
  if (f.includes("natal") || f.includes("chart")) return "star-circle-outline";
  if (f.includes("special") || f.includes("someone")) return "heart-outline";
  if (f.includes("energy") || f.includes("today")) return "weather-sunny";
  if (f.includes("friend")) return "account-group-outline";
  if (f.includes("mind")) return "chat-outline";
  return "chat-outline";
}

// Maps the English feature strings (stored in DB) to translation keys
const FEATURE_I18N: Record<string, string> = {
  "What's on your mind?": "explore.general",
  "Cosmic Crossroads":    "explore.cosmicCrossroads",
  "Someone Special":      "explore.someoneSpecial",
  "Friend Dynamics":      "explore.friendDynamics",
  "Tarot Reading":        "explore.tarotReading",
  "Natal Chart Analysis": "explore.birthChartAnalysis",
  "birthMap":             "birthMap.title",
};

function sessionLabel(session: ChatSession, t: TFn): string {
  if (session.title?.trim()) return session.title.trim();
  if (session.feature?.trim()) {
    const key = FEATURE_I18N[session.feature.trim()];
    if (key) return t(key);
    const f = session.feature.trim();
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
  return t("history.chat");
}

type SessionWithMeta = ChatSession & { firstMessage: Message | null; messageCount: number };

// ── Section header (date pill style) ─────────────────────────────────────────

function DatePill({ label }: { label: string }) {
  return (
    <View style={styles.datePillRow}>
      <View style={styles.datePillLine} />
      <Text style={styles.datePillText}>{label}</Text>
      <View style={styles.datePillLine} />
    </View>
  );
}

// ── Chat card ─────────────────────────────────────────────────────────────────

function ChatCard({ session, onPress, t }: { session: SessionWithMeta; onPress: () => void; t: TFn }) {
  const label = sessionLabel(session, t);
  const icon = featureIcon(session.feature ?? null);
  const time = timeAgo(session.updated_at || session.created_at, t);
  const preview = session.firstMessage?.content ?? null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Card header row */}
      <View style={styles.cardHeader}>
        {/* Avatar circle */}
        <View style={styles.avatar}>
          <Text style={styles.avatarStar}>✦</Text>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.senderLabel}>{label}</Text>
          <Text style={styles.cardTime}>{time}</Text>
        </View>

        {session.messageCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{session.messageCount}</Text>
          </View>
        )}
      </View>

      {/* Preview bubble — dark purple AI style */}
      {preview ? (
        <View style={styles.previewBubble}>
          <Text style={styles.starDot}>✦</Text>
          <Text style={styles.previewText} numberOfLines={3}>{preview}</Text>
        </View>
      ) : (
        <View style={[styles.previewBubble, styles.previewBubbleEmpty]}>
          <Text style={styles.previewEmpty}>{t("history.noMessages")}</Text>
        </View>
      )}

      {/* Stars strip */}
      <Text style={styles.starsStrip}>· ✦ · ✦ · ✦ ·</Text>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

  const openSession = (session: SessionWithMeta) => {
    navigation.navigate("ChatSession", {
      sessionId: String(session.id),
      mode: "readonly",
      feature: session.feature ?? undefined,
    });
  };

  const bucketOrder = ["Today", "Yesterday", "This Week", "This Month", "Older"];
  const bucketLabels: Record<string, string> = {
    "Today": t("history.today"),
    "Yesterday": t("history.yesterday"),
    "This Week": t("history.thisWeek"),
    "This Month": t("history.thisMonth"),
    "Older": t("history.older"),
  };
  const bucketMap: Record<string, SessionWithMeta[]> = {};
  for (const s of sessions) {
    const b = dateBucket(s.updated_at || s.created_at);
    if (!bucketMap[b]) bucketMap[b] = [];
    bucketMap[b].push(s);
  }
  const grouped = bucketOrder
    .filter((b) => bucketMap[b]?.length)
    .map((b) => ({ bucket: b, label: bucketLabels[b] ?? b, items: bucketMap[b] }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* Header — navy with gold */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={C.gold} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("history.title")}</Text>
        <View style={{ width: 22 }} />
      </View>
      {/* Gold gradient divider */}
      <View style={styles.headerDivider} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={C.gold} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyStars}>✦  ✦  ✦</Text>
            <Text style={styles.emptyText}>{t("history.noConversations")}</Text>
            <Text style={styles.emptySubtext}>{t("history.noConversationsSubtitle")}</Text>
          </View>
        ) : (
          grouped.map(({ bucket, label, items }) => (
            <View key={bucket}>
              <DatePill label={label} />
              {items.map((session) => (
                <React.Fragment key={session.id}>
                  <ChatCard session={session} onPress={() => openSession(session)} t={t} />
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.navy },

  // Header
  header: {
    backgroundColor: C.navy,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: C.gold,
    letterSpacing: 0.4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: C.gold,
    opacity: 0.4,
  },

  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // Date pill
  datePillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  datePillLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  datePillText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.textMuted,
    marginHorizontal: 12,
  },

  // Card
  card: {
    backgroundColor: C.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardPressed: { opacity: 0.82 },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },

  // Avatar circle
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.deepPurple,
    borderWidth: 1.5,
    borderColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarStar: {
    fontSize: 13,
    color: C.gold,
  },

  cardMeta: { flex: 1 },
  senderLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: C.goldLabel,
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 0.3,
  },

  countBadge: {
    backgroundColor: C.gold,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.navy,
  },

  // Preview bubble — dark purple AI style
  previewBubble: {
    backgroundColor: C.bubbleAiBg,
    marginHorizontal: 14,
    marginBottom: 2,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: 13,
    shadowColor: C.deepPurple,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  previewBubbleEmpty: {
    backgroundColor: C.surface,
  },
  starDot: {
    fontSize: 8,
    color: C.gold,
    opacity: 0.7,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "300",
    lineHeight: 21,
    color: C.bubbleAiTx,
    letterSpacing: 0.2,
  },
  previewEmpty: {
    fontSize: 13,
    color: C.textMuted,
    fontStyle: "italic",
  },

  // Stars strip
  starsStrip: {
    textAlign: "center",
    fontSize: 10,
    color: C.gold,
    letterSpacing: 6,
    opacity: 0.4,
    paddingVertical: 10,
  },

  // Empty / loading
  centered: {
    paddingTop: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyStars: {
    fontSize: 18,
    color: C.gold,
    letterSpacing: 8,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: C.textMid,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: C.textMuted,
  },
});
