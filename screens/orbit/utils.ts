import { ORBIT_CENTER, ORBIT_RADIUS } from "./constants";
import type { ZodiacInfo } from "../../types/zodiac";

/**
 * Calculates the position of a node on the orbit ring based on angle
 * @param angleDegrees - Angle in degrees (0-360)
 * @returns Position object with left and top coordinates
 */
export function getNodePosition(angleDegrees: number) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const x = ORBIT_CENTER + ORBIT_RADIUS * Math.cos(angleRadians);
  const y = ORBIT_CENTER + ORBIT_RADIUS * Math.sin(angleRadians);
  return { left: x - 32, top: y - 32 }; // -32 to center the 64px node
}


// Order matches files in assets/zodiacs/zodiacSign{index}.png
const ZODIAC_CONFIG: {
  name: string;
  symbol: string;
  index: number;
  start: { month: number; day: number };
  end: { month: number; day: number };
  image: any;
}[] = [
  {
    name: "Aries",
    symbol: "♈",
    index: 1,
    start: { month: 3, day: 21 },
    end: { month: 4, day: 19 },
    image: require("../../assets/zodiacs/zodiacSign1.png"),
  },
  {
    name: "Taurus",
    symbol: "♉",
    index: 2,
    start: { month: 4, day: 20 },
    end: { month: 5, day: 20 },
    image: require("../../assets/zodiacs/zodiacSign2.png"),
  },
  {
    name: "Gemini",
    symbol: "♊",
    index: 3,
    start: { month: 5, day: 21 },
    end: { month: 6, day: 20 },
    image: require("../../assets/zodiacs/zodiacSign3.png"),
  },
  {
    name: "Cancer",
    symbol: "♋",
    index: 4,
    start: { month: 6, day: 21 },
    end: { month: 7, day: 22 },
    image: require("../../assets/zodiacs/zodiacSign4.png"),
  },
  {
    name: "Leo",
    symbol: "♌",
    index: 5,
    start: { month: 7, day: 23 },
    end: { month: 8, day: 22 },
    image: require("../../assets/zodiacs/zodiacSign5.png"),
  },
  {
    name: "Virgo",
    symbol: "♍",
    index: 6,
    start: { month: 8, day: 23 },
    end: { month: 9, day: 22 },
    image: require("../../assets/zodiacs/zodiacSign6.png"),
  },
  {
    name: "Libra",
    symbol: "♎",
    index: 7,
    start: { month: 9, day: 23 },
    end: { month: 10, day: 22 },
    image: require("../../assets/zodiacs/zodiacSign7.png"),
  },
  {
    name: "Scorpio",
    symbol: "♏",
    index: 8,
    start: { month: 10, day: 23 },
    end: { month: 11, day: 21 },
    image: require("../../assets/zodiacs/zodiacSign8.png"),
  },
  {
    name: "Sagittarius",
    symbol: "♐",
    index: 9,
    start: { month: 11, day: 22 },
    end: { month: 12, day: 21 },
    image: require("../../assets/zodiacs/zodiacSign9.png"),
  },
  {
    name: "Capricorn",
    symbol: "♑",
    index: 10,
    start: { month: 12, day: 22 },
    end: { month: 1, day: 19 },
    image: require("../../assets/zodiacs/zodiacSign10.png"),
  },
  {
    name: "Aquarius",
    symbol: "♒",
    index: 11,
    start: { month: 1, day: 20 },
    end: { month: 2, day: 18 },
    image: require("../../assets/zodiacs/zodiacSign11.png"),
  },
  {
    name: "Pisces",
    symbol: "♓",
    index: 12,
    start: { month: 2, day: 19 },
    end: { month: 3, day: 20 },
    image: require("../../assets/zodiacs/zodiacSign12.png"),
  },
];

function isBetweenMonthDay(
  month: number,
  day: number,
  start: { month: number; day: number },
  end: { month: number; day: number }
) {
  // Handle ranges that do NOT cross the year (most signs)
  if (start.month < end.month || (start.month === end.month && start.day <= end.day)) {
    if (month < start.month || month > end.month) return false;
    if (month === start.month && day < start.day) return false;
    if (month === end.month && day > end.day) return false;
    return true;
  }

  // Handle Capricorn-style ranges that cross new year (e.g., Dec 22–Jan 19)
  const inStartYear =
    (month > start.month || (month === start.month && day >= start.day)) && month <= 12;
  const inEndYear = (month >= 1 && month < end.month) || (month === end.month && day <= end.day);

  return inStartYear || inEndYear;
}

/**
 * Core calculator: given month & day, return zodiac info.
 */
export function getZodiacInfoForMonthDay(month: number, day: number): ZodiacInfo | null {
  const config = ZODIAC_CONFIG.find((z) => isBetweenMonthDay(month, day, z.start, z.end));
  if (!config) return null;
  const { name, symbol, index, image } = config;
  return { name, symbol, index, image };
}

/**
 * Convenience: parse a birth date string like "12 Nov 2001" or "2001-11-12"
 * and return zodiac info.
 */
export function getZodiacInfoFromBirthDate(birthDate: string): ZodiacInfo | null {
  if (!birthDate) return null;

  let day: number | undefined;
  let month: number | undefined;

  // Try formats like "12 Nov 2001"
  const parts = birthDate.trim().split(/\s+/);
  if (parts.length >= 2) {
    const dayNum = parseInt(parts[0], 10);
    const monthStr = parts[1].slice(0, 3).toLowerCase();

    const monthMap: Record<string, number> = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    };

    if (!Number.isNaN(dayNum) && monthMap[monthStr]) {
      day = dayNum;
      month = monthMap[monthStr];
    }
  }

  // Fallback: try Date parsing for ISO formats like "2001-11-12"
  if (month === undefined || day === undefined) {
    const d = new Date(birthDate);
    if (!Number.isNaN(d.getTime())) {
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    }
  }

  if (month === undefined || day === undefined) return null;
  return getZodiacInfoForMonthDay(month, day);
}
