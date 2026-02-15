import React, { useState, useCallback } from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";

import { OrbitNode } from "./OrbitNode";
import { getNodePosition, getZodiacInfoForMonthDay } from "./utils";
import { styles } from "./styles";
import { getAllPersons } from "../../db/person.repo";
import type { Person } from "../../db/person.repo";

// Placeholder avatars for orbit nodes (same set as former nodesData)
const NODE_IMAGES = [
  require("../../assets/persons/men1.png"),
  require("../../assets/persons/woman1.png"),
  require("../../assets/persons/woman2.png"),
  require("../../assets/persons/men2.png"),
];

type OrbitNodeItem =
  | { type: "person"; id: string; label: string; angle: number; subtitle?: string; zodiac: string; zodiacSymbol: string; birthDate: string; imageSource?: any }
  | { type: "add"; id: string; angle: number };

function personToBirthDate(p: Person): string {
  if (p.birth_year == null || p.birth_month == null || p.birth_day == null) return "";
  const monthStr = new Date(2000, p.birth_month, 1).toLocaleString("en-US", { month: "short" }).slice(0, 3);
  return `${p.birth_day.toString().padStart(2, "0")} ${monthStr} ${p.birth_year}`;
}

export default function OrbitScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [nodes, setNodes] = useState<OrbitNodeItem[]>([]);

  const loadNodes = useCallback(async () => {
    try {
      const persons = await getAllPersons();
      // When 0 persons: no nodes on the ring; we show a dedicated empty state with Add button.
      if (persons.length === 0) {
        setNodes([]);
        return;
      }
      const count = persons.length + 1; // +1 for add button
      const step = 360 / count;
      const items: OrbitNodeItem[] = [];

      persons.forEach((p, i) => {
        const zodiac = p.birth_month != null && p.birth_day != null
          ? getZodiacInfoForMonthDay(p.birth_month, p.birth_day)
          : null;
        items.push({
          type: "person",
          id: `person-${p.id}`,
          label: p.name ?? "?",
          angle: step * i,
          zodiac: zodiac?.name ?? "",
          zodiacSymbol: zodiac?.symbol ?? "",
          birthDate: personToBirthDate(p),
          imageSource: NODE_IMAGES[i % NODE_IMAGES.length],
        });
      });

      items.push({ type: "add", id: "add", angle: step * persons.length });
      setNodes(items);
    } catch (e) {
      console.warn("Failed to load persons for orbit:", e);
      setNodes([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNodes();
    }, [loadNodes])
  );

  const rootNav = navigation.getParent?.()?.getParent?.() as NativeStackNavigationProp<RootStackParamList> | undefined;

  return (
    <ImageBackground
      source={require("../../assets/Orbit_background.png")}
      resizeMode="cover"
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.orbitWrapper}>
        <View style={styles.outerOrbit} />
        <View style={styles.innerOrbit} />

        <View style={styles.centerWrapper}>
          <View style={styles.centerGlow} />
          <View style={styles.centerCircle}>
            <Text style={styles.centerLabel}>YOU</Text>
          </View>
        </View>

        {nodes.map((node) =>
          node.type === "add" ? (
            <OrbitNode
              key={node.id}
              label=""
              style={getNodePosition(node.angle)}
              isAddButton
              onPress={() => {
                rootNav?.navigate("ChatSession", {
                  feature: "birthMap",
                  mode: "interactive",
                });
              }}
            />
          ) : (
            <OrbitNode
              key={node.id}
              label={node.label}
              subtitle={node.subtitle}
              imageSource={node.imageSource}
              style={getNodePosition(node.angle)}
              onPress={() =>
                navigation.navigate("PersonDetail", {
                  name: node.label,
                  zodiac: node.zodiac,
                  zodiacSymbol: node.zodiacSymbol,
                  birthDate: node.birthDate,
                })
              }
            />
          )
        )}
      </View>

      {/* Empty state: 0 people — clear CTA instead of a lone + on the ring */}
      {nodes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Your orbit is empty</Text>
          <Text style={styles.emptyStateSubtitle}>
            Add people by name and birth date. You can generate their birth maps later from their profile.
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            activeOpacity={0.85}
            onPress={() => {
              rootNav?.navigate("ChatSession", {
                feature: "birthMap",
                mode: "interactive",
              });
            }}
          >
            <Text style={styles.emptyStateButtonText}>Add person</Text>
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
}