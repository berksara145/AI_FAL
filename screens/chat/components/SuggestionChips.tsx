import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../../../utils/theme";

type SuggestionChip = {
  id: string;
  text: string;
};

type SuggestionChipsProps = {
  suggestions: SuggestionChip[];
  onSelect: (suggestion: SuggestionChip) => void;
};

export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {suggestions.map((suggestion) => (
        <TouchableOpacity
          key={suggestion.id}
          onPress={() => onSelect(suggestion)}
          style={styles.chip}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{suggestion.text}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  container: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(120,80,200,0.35)",
    backgroundColor: "#2d1f5e",
  },
  chipText: {
    color: Colors.goldPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
});
