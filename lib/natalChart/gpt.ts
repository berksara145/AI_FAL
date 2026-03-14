import { normalizeDeg, generateApproxChart } from "./core";
import { ZODIAC_SYMBOLS } from "./symbols";
import type { ChartForGpt } from "./types";

function degToDegStr(degInSign: number): string {
  const d = Math.floor(degInSign);
  const min = Math.round((degInSign % 1) * 60);
  return `${d}°${min.toString().padStart(2, "0")}'`;
}

const ELEMENT_BY_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire",
  Taurus: "earth",
  Gemini: "air",
  Cancer: "water",
  Leo: "fire",
  Virgo: "earth",
  Libra: "air",
  Scorpio: "water",
  Sagittarius: "fire",
  Capricorn: "earth",
  Aquarius: "air",
  Pisces: "water",
};

const MODALITY_BY_SIGN: Record<string, "cardinal" | "fixed" | "mutable"> = {
  Aries: "cardinal",
  Taurus: "fixed",
  Gemini: "mutable",
  Cancer: "cardinal",
  Leo: "fixed",
  Virgo: "mutable",
  Libra: "cardinal",
  Scorpio: "fixed",
  Sagittarius: "mutable",
  Capricorn: "cardinal",
  Aquarius: "fixed",
  Pisces: "mutable",
};

const MAX_ASPECT_ORB = 6; // trim very loose aspects for interpretation quality
const LUMINARIES: Set<string> = new Set(["Sun", "Moon"]);

export function generateChartForGpt(
  chart: ReturnType<typeof generateApproxChart>,
  locationName: string
): ChartForGpt {
  const signIndex = (lon: number) => Math.floor(normalizeDeg(lon) / 30) % 12;
  const signName = (lon: number) => ZODIAC_SYMBOLS[signIndex(lon)].name;
  const degInSign = (lon: number) => normalizeDeg(lon) % 30;

  const angleEntry = (lon: number) => ({
    sign: signName(lon),
    deg: Math.round(degInSign(lon) * 100) / 100,
    degStr: degToDegStr(degInSign(lon)),
  });

  const placements = chart.bodies.map((b) => ({
    body: b.key,
    sign: signName(b.lon),
    deg: Math.round(degInSign(b.lon) * 100) / 100,
    degStr: degToDegStr(degInSign(b.lon)),
    house: b.house,
  }));

  const aspectStrength = (orb: number): "tight" | "medium" | "loose" =>
    orb <= 1 ? "tight" : orb <= 3 ? "medium" : "loose";

  const aspectsRaw = chart.aspects.map((a) => ({
    a: a.a,
    b: a.b,
    type: a.type.toLowerCase(),
    orb: Math.round(a.orb * 100) / 100,
    strength: aspectStrength(a.orb),
  }));
  const aspects = aspectsRaw.filter(
    (a) => a.orb <= MAX_ASPECT_ORB || LUMINARIES.has(a.a) || LUMINARIES.has(a.b)
  );

  const asc = chart.angles.asc;
  const houseSignMap: Record<string, string> = {};
  for (let h = 1; h <= 12; h++) {
    houseSignMap[String(h)] = signName(normalizeDeg(asc + (h - 1) * 30));
  }

  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of placements) {
    const el = ELEMENT_BY_SIGN[p.sign];
    const mod = MODALITY_BY_SIGN[p.sign];
    if (el) elements[el]++;
    if (mod) modalities[mod]++;
  }

  return {
    meta: {
      zodiac: "tropical",
      houseSystem: "equal_house",
      location: locationName,
      note: "All degrees are ecliptic longitude. Houses are equal (30° each, 1st cusp = Ascendant).",
    },
    angles: {
      asc: angleEntry(chart.angles.asc),
      mc: angleEntry(chart.angles.mc),
    },
    houseSignMap,
    placements,
    aspects,
    emphasis: { elements, modalities },
  };
}

