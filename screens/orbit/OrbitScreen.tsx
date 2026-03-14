import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootStack";

import { OrbitNode } from "./OrbitNode";
import { getNodePosition, getZodiacInfoForMonthDay } from "./utils";
import { styles } from "./styles";
import { useOrbitNodes, personToBirthDate } from "./hooks/useOrbitNodes";

export default function OrbitScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const rootNav = navigation.getParent?.()?.getParent?.() as
    | NativeStackNavigationProp<RootStackParamList>
    | undefined;

  const { nodes, selfPerson } = useOrbitNodes();

  const navigateToAddPerson = () =>
    rootNav?.navigate("ChatSession", { feature: "birthMap", mode: "interactive" });

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
          <TouchableOpacity
            activeOpacity={selfPerson ? 0.85 : 1}
            style={styles.centerCircle}
            disabled={!selfPerson}
            onPress={() => {
              if (!selfPerson) return;
              const zodiacInfo =
                selfPerson.birth_month != null && selfPerson.birth_day != null
                  ? getZodiacInfoForMonthDay(selfPerson.birth_month, selfPerson.birth_day)
                  : null;
              navigation.navigate("PersonDetail", {
                name: selfPerson.name ?? "You",
                zodiac: zodiacInfo?.name ?? "",
                zodiacSymbol: zodiacInfo?.symbol ?? "",
                birthDate: personToBirthDate(selfPerson),
              });
            }}
          >
            <Text style={styles.centerLabel}>YOU</Text>
          </TouchableOpacity>
        </View>

        {nodes.map((node) =>
          node.type === "add" ? (
            <OrbitNode
              key={node.id}
              label=""
              style={getNodePosition(node.angle)}
              isAddButton
              onPress={navigateToAddPerson}
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

      <View style={styles.pageDescription}>
        <Text style={styles.pageDescriptionTitle}>Your Celestial Circle</Text>
        <Text style={styles.pageDescriptionText}>
          Add the people in your life to explore their natal charts and astrological connections.
        </Text>
        {nodes.length > 0 && (
          <Text style={styles.pageDescriptionHint}>Tap a person to view their birth chart</Text>
        )}
      </View>

      {nodes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Your birth chart is empty</Text>
          <Text style={styles.emptyStateSubtitle}>
            Add people by name and birth date. You can generate their birth maps later from their profile.
          </Text>
          <TouchableOpacity style={styles.emptyStateButton} activeOpacity={0.85} onPress={navigateToAddPerson}>
            <Text style={styles.emptyStateButtonText}>Add person</Text>
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
}
