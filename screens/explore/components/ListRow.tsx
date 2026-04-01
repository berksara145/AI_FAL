import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles, C } from "../styles";

type Props = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  onPress?: () => void;
  borderTop?: boolean;
};

export default function ListRow({
  icon,
  iconBg,
  iconBorder,
  iconColor,
  title,
  subtitle,
  titleColor,
  subtitleColor,
  onPress,
  borderTop,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.listRow, borderTop && styles.listRowBorderTop]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}>
        <MaterialCommunityIcons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, titleColor ? { color: titleColor } : null]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSub, subtitleColor ? { color: subtitleColor } : null]}>{subtitle}</Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={16} color={`${C.gold}55`} />
    </TouchableOpacity>
  );
}
