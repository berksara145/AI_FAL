import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface IOSDatePickerProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  label?: string;
  formatter?: (value: number) => string;
}

export default function IOSDatePicker({
  value,
  onValueChange,
  min,
  max,
  label,
  formatter = (v) => v.toString(),
}: IOSDatePickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const centerIndexOffset = Math.floor(VISIBLE_ITEMS / 2);
  const padding = centerIndexOffset * ITEM_HEIGHT;
  const selectedIndex = items.indexOf(value);

  // Update scroll position when value changes (matches WheelPicker logic)
  useEffect(() => {
    if (selectedIndex >= 0) {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex]);

  // Scrolling physics logic from WheelPicker
  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (index !== selectedIndex && index >= 0 && index < items.length) {
      onValueChange(items[index]);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.pickerWrapper}>
        {/* Selection indicator */}
        <View style={styles.selectionIndicator} pointerEvents="none" />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={ITEM_HEIGHT}
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={{
            paddingVertical: padding,
          }}
        >
          {items.map((item) => {
            const isSelected = item === value;
            return (
              <View key={item} style={styles.item}>
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.selectedItemText,
                  ]}
                >
                  {formatter(item)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#d4af37",
  },
  pickerWrapper: {
    height: PICKER_HEIGHT,
    overflow: "hidden",
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    backgroundColor: "rgba(212,175,55,0.08)",
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
    color: "#888",
  },
  selectedItemText: {
    fontSize: 22,
    color: "#d4af37",
    fontWeight: "600",
  },
});
