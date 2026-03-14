export type BodyKey =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";

export type AspectType = "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition";
export type AspectColor = "red" | "blue" | "gray";

export type AspectLine = {
  a: BodyKey;
  b: BodyKey;
  type: AspectType;
  exact: number;     // 0/60/90/120/180
  delta: number;     // 0..180 actual separation
  orb: number;       // abs(delta - exact)
  color: AspectColor;
};

export interface ChartStyle {
  size?: number;
  backgroundColor?: string;
  starry?: boolean;
  starCount?: number;
  primaryRingColor?: string;
  secondaryRingColor?: string;
  accentColor?: string;
  zodiacTextColor?: string;
  bodyIconSize?: number;
  /** Optional URIs for zodiac sign images (12 items, index 0=Aries..11=Pisces). When set, chart uses these instead of Unicode symbols. */
  zodiacImageUrls?: string[];
  useGradients?: boolean;
  glowEffect?: boolean;
}

// Note: keep this free of utils/theme import to avoid circular deps (lib → utils → lib).
// ChartColors in utils/theme.ts mirrors these values for app-level usage.
export const DEFAULT_STYLE: ChartStyle = {
  size: 800,
  backgroundColor: "#1a0033",
  starry: true,
  starCount: 300,
  primaryRingColor: "#d4af37",
  secondaryRingColor: "#8b6914",
  accentColor: "#ff69b4",
  zodiacTextColor: "#d4af37",
  bodyIconSize: 32,
  useGradients: true,
  glowEffect: true,
};

export type ChartForGpt = {
  meta: { zodiac: string; houseSystem: string; location: string; note: string };
  angles: {
    asc: { sign: string; deg: number; degStr: string };
    mc: { sign: string; deg: number; degStr: string };
  };
  houseSignMap: Record<string, string>; // "1".."12" -> sign name (equal house: 1st = Asc sign, etc.)
  placements: Array<{ body: string; sign: string; deg: number; degStr: string; house: number }>;
  aspects: Array<{ a: string; b: string; type: string; orb: number; strength: "tight" | "medium" | "loose" }>;
  emphasis: {
    elements: { fire: number; earth: number; air: number; water: number };
    modalities: { cardinal: number; fixed: number; mutable: number };
  };
};

