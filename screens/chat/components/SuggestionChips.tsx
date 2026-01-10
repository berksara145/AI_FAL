import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

type SuggestionChip = {
  id: string;
  text: string;
  action?: () => void;
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
      className="px-4 py-2"
      contentContainerClassName="gap-2"
    >
      {suggestions.map((suggestion) => (
        <TouchableOpacity
          key={suggestion.id}
          onPress={() => onSelect(suggestion)}
          className="bg-purple-100 border border-purple-300 rounded-full px-4 py-2"
          activeOpacity={0.7}
        >
          <Text className="text-purple-700 text-sm font-medium">
            {suggestion.text}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
