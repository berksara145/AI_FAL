import React from "react";
import { View, Text, StyleSheet, Dimensions, ImageBackground, Platform, Image } from "react-native";

const { width } = Dimensions.get("window");
const ORBIT_SIZE = width * 0.9;
const CENTER_SIZE = width * 0.38;
const ORBIT_RADIUS = (ORBIT_SIZE / 2) * 0.90; // Reduced by 12% to bring it inside
const ORBIT_CENTER = ORBIT_SIZE / 2;
const OUTER_ORBIT_SIZE = ORBIT_SIZE * 0.90; // Match the reduced radius

// Helper function to position nodes on the orbit ring
function getNodePosition(angleDegrees: number) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const x = ORBIT_CENTER + ORBIT_RADIUS * Math.cos(angleRadians);
  const y = ORBIT_CENTER + ORBIT_RADIUS * Math.sin(angleRadians);
  return { left: x - 32, top: y - 32 }; // -32 to center the 64px node
}

type OrbitNodeProps = {
  label: string;
  subtitle?: string;
  style: any;
  icon?: React.ReactNode | string;
  imageSource?: any;
};

function OrbitNode({ label, subtitle, style, icon, imageSource }: OrbitNodeProps) {
  return (
    <View style={[styles.nodeContainer, style]}>
      {/* Golden outer ring */}
      <View style={styles.nodeCircleOuter}>
        {/* Lighter purple ring */}
        <View style={styles.nodeCircleMiddle}>
          {/* Inner fill */}
          <View style={styles.nodeCircleInner}>
            {imageSource ? (
              <Image source={imageSource} style={styles.nodeImage} resizeMode="contain" />
            ) : typeof icon === "string" ? (
              <Text style={styles.nodeIconText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        </View>
      </View>
      <Text style={styles.nodeLabel}>{label}</Text>
      {subtitle ? <Text style={styles.nodeSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export default function OrbitScreen() {
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
        <OrbitNode
          label="Ali"
          icon="👤"
          style={getNodePosition(30)}
        />
        <OrbitNode
          label="Dr. Elara"
          icon="🧠"
          style={getNodePosition(90)}
        />
        <OrbitNode
          label="Helena"
          icon="🌅"
          style={getNodePosition(150)}
        />
        <OrbitNode
          label="Kaan"
          icon="💼"
          style={getNodePosition(210)}
        />
        <OrbitNode
          label="Ahmet"
          imageSource={require("../../assets/node1.png")}
          style={getNodePosition(270)}
        />
        <OrbitNode
          label="Betül"
          icon="✨"
          style={getNodePosition(330)}
        />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Named anchors</Text>
        <Text style={styles.legendText}>
          These people, dreams and themes are the recurring elements in your inner universe.
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050016",
    alignItems: "center",
    paddingTop: 56,
  },
  backgroundImage: {
    opacity: 0.9,
  },
  title: {
    fontSize: 26,
    letterSpacing: 4,
    color: "#f7e3a5",
    marginBottom: 24,
    fontWeight: "400",
    textTransform: "uppercase",
  },
  orbitWrapper: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  outerOrbit: {
    position: "absolute",
    width: OUTER_ORBIT_SIZE,
    height: OUTER_ORBIT_SIZE,
    borderRadius: OUTER_ORBIT_SIZE / 2,
    borderWidth: 1,
    borderColor: "rgba(250, 218, 134, 0.6)",
    left: (ORBIT_SIZE - OUTER_ORBIT_SIZE) / 2,
    top: (ORBIT_SIZE - OUTER_ORBIT_SIZE) / 2,
  },
  innerOrbit: {
    position: "absolute",
    width: ORBIT_SIZE * 0.60,
    height: ORBIT_SIZE * 0.60,
    borderRadius: (ORBIT_SIZE * 0.60) / 2,
    borderWidth: 1,
    borderColor: "#FADA86",
  },

  /* ✨ CENTER GLOW SYSTEM */
  centerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerGlow: {
    position: "absolute",
    width: CENTER_SIZE * 1.15,
    height: CENTER_SIZE * 1.15,
    borderRadius: (CENTER_SIZE * 1.15) / 2,
    borderWidth: 0,
    borderColor: "rgba(250, 218, 134, 0.25)",
    shadowColor: "#FADA86",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 25,
    top: -20,
  },
  centerCircle: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    borderWidth: 8,
    borderColor: "#FADA86",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    color: "#E6CB8B",
    fontSize: 22,
    letterSpacing: 4,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },

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
  legend: {
    marginTop: 32,
    paddingHorizontal: 32,
  },
  legendTitle: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: "#f7e3a5",
    marginBottom: 8,
  },
  legendText: {
    fontSize: 13,
    color: "rgba(245, 234, 200, 0.85)",
    textAlign: "center",
    lineHeight: 18,
  },
});
