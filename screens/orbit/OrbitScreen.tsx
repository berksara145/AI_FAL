import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { OrbitNode } from "./OrbitNode";
import { getNodePosition } from "./utils";
import { styles } from "./styles";
import { orbitNodes } from "./nodesData";
import type { MainStackParamList } from "../../navigation/MainTabs";

export default function OrbitScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

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
        {orbitNodes.map((node) => (
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
