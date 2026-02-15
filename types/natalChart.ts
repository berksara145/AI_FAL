/**
 * Natal Chart Data Types
 * Defines the structure for birth chart data and configurations
 */

export interface BirthData {
  name?: string;
  /** UTC instant used for chart calculation; hour/minute match birthTime when input is treated as UTC. */
  birthDate: Date;
  /** User-entered hour/minute (same as birthDate’s UTC hour/minute until we add timezone lookup). */
  birthTime: {
    hour: number;
    minute: number;
  };
  birthLocation: {
    placeName: string;
    placeId: string;
    latitude: number;
    longitude: number;
  };
}

export interface PlanetPosition {
  bodyKey: string;
  symbol: string;
  longitude: number;
  house: number;
  degree: number; // degree within sign (0-30)
  sign: string;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition";
  angle: number;
  orb: number;
  color: "red" | "blue" | "gray";
}

export interface AngleData {
  asc: number; // Ascendant
  mc: number; // Midheaven
  dsc: number; // Descendant
  ic: number; // Imum Coeli
}

export interface HouseData {
  cusps: number[]; // 12 house cusps
}

export interface NatalChartData {
  birthData: BirthData;
  angles: AngleData;
  houses: HouseData;
  planets: PlanetPosition[];
  aspects: AspectData[];
  generatedAt: Date;
}

export interface ChartStyleConfig {
  size?: number;
  backgroundColor?: string;
  starry?: boolean;
  starCount?: number;
  primaryRingColor?: string;
  secondaryRingColor?: string;
  accentColor?: string;
  zodiacTextColor?: string;
  bodyIconSize?: number;
  /** Optional URIs for zodiac sign images (12 items, index 0=Aries..11=Pisces). */
  zodiacImageUrls?: string[];
  useGradients?: boolean;
  glowEffect?: boolean;
}

export interface GeneratedChart {
  svgContent: string;
  chartData: NatalChartData;
  style: ChartStyleConfig;
  filePath?: string; // Where the chart was saved
}
