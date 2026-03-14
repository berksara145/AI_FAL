// Main entry point for the natal chart module.
// Import from "lib/natalChart" to get everything.

export type { BodyKey, AspectType, AspectColor, AspectLine, ChartStyle, ChartForGpt } from "./types";
export { DEFAULT_STYLE } from "./types";

export { generateApproxChart, normalizeDeg } from "./core";
export { generateStyledChart } from "./svg";
export { generateChartForGpt } from "./gpt";
export { ZODIAC_SYMBOLS, PLANET_SYMBOLS } from "./symbols";
