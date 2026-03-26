import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CENTER = Math.floor(VISIBLE_ITEMS / 2); // 2

const SNAP_CFG = { damping: 32, stiffness: 260, mass: 0.5 };

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
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const count = items.length;
  const minOffset = -(count - 1) * ITEM_HEIGHT;

  const offsetY   = useSharedValue(-(items.indexOf(value)) * ITEM_HEIGHT);
  const startY    = useSharedValue(0);

  // Prevent useEffect from re-scrolling when WE triggered the value change
  const internalRef = useRef(false);

  const commitValue = (idx: number) => {
    internalRef.current = true;
    onValueChange(items[idx]);
  };

  // Sync when value is changed externally (e.g. month → day max shrinks)
  useEffect(() => {
    if (internalRef.current) {
      internalRef.current = false;
      return;
    }
    const idx = items.indexOf(value);
    if (idx >= 0) {
      offsetY.value = withSpring(-idx * ITEM_HEIGHT, SNAP_CFG);
    }
  }, [value, min, max]);

  // ── Gesture ────────────────────────────────────────────────────────────────
  const gesture = Gesture.Pan()
    .onBegin(() => {
      "worklet";
      startY.value = offsetY.value;
    })
    .onUpdate((e) => {
      "worklet";
      offsetY.value = Math.max(minOffset, Math.min(0, startY.value + e.translationY));
    })
    .onEnd((e) => {
      "worklet";
      // Project landing position from velocity, snap there immediately with spring.
      // This gives Apple-like momentum feel with zero end-of-scroll lag.
      const projected = offsetY.value + e.velocityY * 0.18;
      const clamped   = Math.max(minOffset, Math.min(0, projected));
      const idx       = Math.max(0, Math.min(count - 1, Math.round(-clamped / ITEM_HEIGHT)));
      const target    = -idx * ITEM_HEIGHT;
      offsetY.value   = withSpring(target, { ...SNAP_CFG, velocity: e.velocityY });
      runOnJS(commitValue)(idx);
    });

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value + CENTER * ITEM_HEIGHT }],
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.pickerWrapper}>
        {/* Selection band — same as original */}
        <View style={styles.selectionIndicator} pointerEvents="none" />

        <GestureDetector gesture={gesture}>
          <View style={styles.gestureArea}>
            <Animated.View style={listStyle}>
              {items.map((item) => (
                <View key={item} style={styles.item}>
                  <Text style={[styles.itemText, item === value && styles.selectedItemText]}>
                    {formatter(item)}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </GestureDetector>
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
    position: "relative",
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT * CENTER,
    height: ITEM_HEIGHT,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    backgroundColor: "rgba(212,175,55,0.08)",
    zIndex: 2,
  },
  gestureArea: {
    height: PICKER_HEIGHT,
    overflow: "hidden",
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
