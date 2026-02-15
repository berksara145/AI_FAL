import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { OrbitNode } from "./OrbitNode";
import { getNodePosition } from "./utils";
import { styles } from "./styles";
import { orbitNodes as staticNodes } from "./nodesData";
import type { MainStackParamList } from "../../navigation/MainTabs";
import { useEffect, useState } from "react";
import { getAllPersons } from "../../db/person.repo";
import type { NodeData } from "./nodesData";

export default function OrbitScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [nodes, setNodes] = useState<NodeData[]>(staticNodes);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const persons = await getAllPersons();
        console.log("persons", persons.map((p) => p.name));
        if (!mounted) return;
        // Map DB persons to node entries, trying to preserve static node metadata (image, zodiac)
        const merged = staticNodes.map((s) => {
          const p = persons.find((pp) => pp.name === s.label);
          return {
            ...s,
            birthDate: p && p.birth_year ? `${p.birth_day?.toString().padStart(2,"0")} ${new Date(Number(p.birth_year), (p.birth_month||1)-1, Number(p.birth_day)).toLocaleString('en-US', { month: 'short' }).slice(0,3)} ${p.birth_year}` : s.birthDate,
          };
        });
        setNodes(merged);
      } catch (e) {
        console.warn("Failed to load persons for orbit:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/Orbit_background.png")}
      resizeMode="cover"
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.orbitWrapper}>
        {/* Outer orbit ring */}
        <View style={styles.outerOrbit} />

        {/* Inner orbit ring */}
        <View style={styles.innerOrbit} />

        {/* Center YOU with glow */}
        <View style={styles.centerWrapper}>
          <View style={styles.centerGlow} />
          <View style={styles.centerCircle}>
            <Text style={styles.centerLabel}>YOU</Text>
          </View>
        </View>

        {/* Nodes positioned on the outer orbit ring */}
        {nodes.map((node) => (
          <OrbitNode
            key={node.label}
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
        ))}
      </View>
    </ImageBackground>
  );
}
