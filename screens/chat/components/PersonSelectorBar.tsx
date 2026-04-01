import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "../../../utils/theme";
import type { Person } from "../../../db/person.repo";

type Props = {
  persons: Person[];
  noCharts: boolean;
  onSelect: (person: Person) => void;
  onCreateChart: () => void;
};

export default function PersonSelectorBar({ persons, noCharts, onSelect, onCreateChart }: Props) {
  const { t } = useTranslation();

  if (noCharts) {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.pill, styles.createChartPill]}
          onPress={onCreateChart}
          activeOpacity={0.7}
        >
          <Text style={styles.pillText}>{t("chat.goToBirthChart")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {persons.map((p) => (
        <TouchableOpacity
          key={p.name}
          style={styles.pill}
          onPress={() => onSelect(p)}
          activeOpacity={0.7}
        >
          <Text style={styles.pillText}>{p.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(120,80,200,0.35)",
    backgroundColor: "#2d1f5e",
  },
  createChartPill: {
    backgroundColor: "#2d1f5e",
  },
  pillText: {
    color: Colors.goldPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
});
