import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type OrbitNodeProps = {
  label: string;
  subtitle?: string;
  style: any;
  icon?: React.ReactNode | string;
  imageSource?: any;
  onPress?: () => void;
  /** When true, show a + in the circle and use as "add person" slot */
  isAddButton?: boolean;
};

export function OrbitNode({ label, subtitle, style, icon, imageSource, onPress, isAddButton }: OrbitNodeProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.nodeContainer, style]}
    >
      {/* Golden outer ring */}
      <View style={styles.nodeCircleOuter}>
        {/* Lighter purple ring */}
        <View style={styles.nodeCircleMiddle}>
          {/* Inner fill */}
          <View style={styles.nodeCircleInner}>
            {isAddButton ? (
              <MaterialCommunityIcons name="plus" size={32} color="#FADA86" />
            ) : imageSource ? (
              <Image source={imageSource} style={styles.nodeImage} resizeMode="contain" />
            ) : typeof icon === "string" ? (
              <Text style={styles.nodeIconText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        </View>
      </View>
      <Text style={styles.nodeLabel}>{isAddButton ? "Add" : label}</Text>
      {!isAddButton && subtitle ? <Text style={styles.nodeSubtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    position: "absolute",
    alignItems: "center",
  },
  nodeCircleOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#FADA86",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  nodeCircleMiddle: {
    width: 59,
    height: 59,
    borderRadius: 30,
    borderWidth: 11,
    borderColor: "#693A63", // Lighter purple ring
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  nodeCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#311034", // Inner fill color
  },
  nodeIconText: {
    fontSize: 26,
    textAlign: "center",
  },
  nodeImage: {
    width: 40,
    height: 40,
    tintColor: "#FADA86",
  },
  nodeLabel: {
    color: "#FADA86",
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
  nodeSubtitle: {
    color: "rgba(247, 227, 165, 0.8)",
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
});
