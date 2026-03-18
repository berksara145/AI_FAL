/**
 * App-wide design tokens.
 * Always import colors from here — never hardcode hex values in screens or styles.
 */

export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────────
  bgDeepest: "#0a0015",       // chart backgrounds, very dark scenes
  bgDark: "#050016",          // PersonDetail background
  bgMain: "#1a0d2e",          // primary app background (most screens)
  bgCard: "#2d1b3d",          // card / panel backgrounds

  // ── Brand Golds ──────────────────────────────────────────────
  goldPrimary: "#d4af37",     // main gold: rings, titles, borders
  goldSecondary: "#8b6914",   // secondary ring / darker gold
  goldBright: "#ffd700",      // bright gold (zodiac labels in chart)
  goldLight: "#FADA86",       // light gold: pills, small labels
  goldPale: "#f7e3a5",        // pale cream: body text
  goldCream: "#fdf4c8",       // very pale: CTA text

  // ── Accents ──────────────────────────────────────────────────
  pinkHot: "#ff1493",         // hot pink: chart accent color
  pinkLight: "#ff69b4",       // lighter pink: trine/sextile aspect lines
  skyBlue: "#87ceeb",         // aspect lines (blue aspects)
  purple: "#6366f1",          // explore / feature color

  // ── Text ─────────────────────────────────────────────────────
  white: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  textFaint: "rgba(255,255,255,0.4)",

  // ── Orbit UI ─────────────────────────────────────────────────
  orbitNodeRing: "#693A63",   // middle ring of orbit nodes
  orbitNodeFill: "#311034",   // inner fill of orbit nodes

  // ── Semantic ─────────────────────────────────────────────────
  error: "#e57373",
  borderGold: "rgba(212, 175, 55, 0.2)",        // subtle gold border
  borderGoldStrong: "rgba(250, 218, 134, 0.9)", // pill / ring borders
  borderGoldMid: "rgba(250, 218, 134, 0.7)",    // outer ring borders
} as const;

/** Chat screen color palette — parchment + deep navy theme. */
export const ChatColors = {
  bg:           "#cfc0a3",   // parchment background
  headerBg:     "#120c28",   // deep navy header
  inputBarBg:   "#c4b597",   // slightly darker parchment for input bar
  inputFieldBg: "#b8a98a",   // surface — input pill
  border:       "rgba(100,80,40,0.18)",

  lunaraLabel:  "#7a5810",   // gold-brown label (AI)
  lunaraText:   "#0f0920",   // near-black text (AI)
  lunaraBorder: "rgba(201,168,76,0.5)",  // gold left rule on AI text
  streamCursor: "#c9a84c",

  userLabel:    "#5a4a78",   // muted lavender label (user)
  userText:     "#221550",   // deep indigo text (user)
  userDot:      "#9b8cc8",   // lavender dot

  placeholder:  "rgba(90,74,120,0.6)",
  sendActive:   "#c9a84c",
  sendInactive: "rgba(201,168,76,0.28)",
  typingColor:  "#c9a84c",
  loadingText:  "rgba(122,88,16,0.7)",
  divider:      "rgba(100,80,40,0.20)",
} as const;

/** Default natal chart style. Import this wherever a chart is generated. */
export const ChartColors = {
  background: Colors.bgDeepest,
  primaryRing: Colors.goldPrimary,
  secondaryRing: Colors.goldSecondary,
  accent: Colors.pinkHot,
  zodiacText: Colors.goldBright,
} as const;

export type ColorKey = keyof typeof Colors;
