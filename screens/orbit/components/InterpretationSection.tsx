import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../../utils/theme";

const SECTION_META: Record<string, { subtitle: string; accent: string }> = {
  "Core Identity": { subtitle: "Sun · Moon · Rising",    accent: "rgba(212,175,55,0.8)"  },
  "Inner World":   { subtitle: "Emotions · Aspects",     accent: "rgba(180,140,255,0.8)" },
  "Life Path":     { subtitle: "Purpose · Growth",       accent: "rgba(100,210,190,0.8)" },
};

function parseSections(text: string): { header: string; body: string }[] {
  const parts = text.split(/\*\*✦\s+/);
  return parts
    .filter((p) => p.trim())
    .map((part) => {
      const nl     = part.indexOf("\n");
      const header = (nl > -1 ? part.slice(0, nl) : part).replace(/\*\*/g, "").trim();
      const body   = (nl > -1 ? part.slice(nl)   : "").replace(/\*\*/g, "").trim();
      return { header, body };
    })
    .filter((s) => s.header && s.body);
}

type Props = { text: string };

export default function InterpretationSection({ text }: Props) {
  const sections = parseSections(text);

  if (sections.length === 0) {
    return (
      <Text style={styles.sectionBody}>
        {text.replace(/\*\*/g, "").trim()}
      </Text>
    );
  }

  return (
    <>
      {sections.map(({ header, body }) => {
        const meta = SECTION_META[header] ?? { subtitle: "", accent: "rgba(212,175,55,0.8)" };
        return (
          <View key={header} style={[styles.sectionCard, { borderLeftColor: meta.accent }]}>
            <Text style={[styles.sectionCardTitle, { color: meta.accent }]}>
              ✦ {header.toUpperCase()}
            </Text>
            {meta.subtitle ? (
              <Text style={styles.sectionCardSubtitle}>{meta.subtitle}</Text>
            ) : null}
            <View style={styles.bulletList}>
              {body.split("\n").filter((l) => l.trim()).map((line, i) => {
                const clean = line.replace(/^[-•]\s*/, "").trim();
                return (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bulletDot, { color: meta.accent }]}>·</Text>
                    <Text style={styles.sectionCardBody}>{clean}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderLeftWidth: 3,
    borderRadius: 12,
    backgroundColor: "rgba(26, 13, 46, 0.75)",
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 16,
  },
  sectionCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  sectionCardSubtitle: {
    fontSize: 11,
    color: "rgba(245, 234, 200, 0.4)",
    letterSpacing: 1,
    marginBottom: 10,
  },
  bulletList: {
    gap: 8,
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    fontSize: 20,
    lineHeight: 26,
  },
  sectionCardBody: {
    flex: 1,
    fontSize: 15,
    color: "rgba(245, 234, 200, 0.9)",
    lineHeight: 26,
    fontWeight: "300",
  },
  sectionBody: {
    fontSize: 15,
    color: "rgba(245, 234, 200, 0.9)",
    lineHeight: 26,
    fontWeight: "300",
  },
});
