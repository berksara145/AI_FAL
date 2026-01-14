import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Reduced from 0.9 to 0.85 to prevent nodes from overflowing on smaller screens
export const ORBIT_SIZE = Math.min(width * 0.85, height * 0.75);
export const CENTER_SIZE = width * 0.38;
export const ORBIT_RADIUS = (ORBIT_SIZE / 2) * 0.90; // Reduced by 12% to bring it inside
export const ORBIT_CENTER = ORBIT_SIZE / 2;
export const OUTER_ORBIT_SIZE = ORBIT_SIZE * 0.90; // Match the reduced radius
export const SCREEN_HEIGHT = height;
