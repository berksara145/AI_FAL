import type { BodyKey } from "./types";

export const ZODIAC_SYMBOLS: Record<number, { name: string; symbol: string }> = {
  0:  { name: "Aries",       symbol: "♈" },
  1:  { name: "Taurus",      symbol: "♉" },
  2:  { name: "Gemini",      symbol: "♊" },
  3:  { name: "Cancer",      symbol: "♋" },
  4:  { name: "Leo",         symbol: "♌" },
  5:  { name: "Virgo",       symbol: "♍" },
  6:  { name: "Libra",       symbol: "♎" },
  7:  { name: "Scorpio",     symbol: "♏" },
  8:  { name: "Sagittarius", symbol: "♐" },
  9:  { name: "Capricorn",   symbol: "♑" },
  10: { name: "Aquarius",    symbol: "♒" },
  11: { name: "Pisces",      symbol: "♓" },
};

export const PLANET_SYMBOLS: Record<BodyKey, { symbol: string; shortName: string }> = {
  Sun: { symbol: "☉", shortName: "Su" },
  Moon: { symbol: "☽", shortName: "Mo" },
  Mercury: { symbol: "☿", shortName: "Me" },
  Venus: { symbol: "♀", shortName: "Ve" },
  Mars: { symbol: "♂", shortName: "Ma" },
  Jupiter: { symbol: "♃", shortName: "Ju" },
  Saturn: { symbol: "♄", shortName: "Sa" },
  Uranus: { symbol: "♅", shortName: "Ur" },
  Neptune: { symbol: "♆", shortName: "Ne" },
  Pluto: { symbol: "♇", shortName: "Pl" },
};

