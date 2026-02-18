import {
  Body,
  GeoVector,
  Observer,
  Ecliptic,
  SiderealTime
} from "astronomy-engine";

type BodyKey =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";

const BODY_MAP: Record<BodyKey, Body> = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

function normalizeDeg(x: number) {
  const r = x % 360;
  return r < 0 ? r + 360 : r;
}

function smallestDeltaDeg(a: number, b: number): number {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return d > 180 ? 360 - d : d; // 0..180
}

function houseOfLon(lon: number, cusps: number[]) {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    if (a < b) {
      if (lon >= a && lon < b) return i + 1;
    } else {
      if (lon >= a || lon < b) return i + 1;
    }
  }
  return 12;
}

// -------- aspects (for inner lines) --------

type AspectType = "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition";
type AspectColor = "red" | "blue" | "gray";

export type AspectLine = {
  a: BodyKey;
  b: BodyKey;
  type: AspectType;
  exact: number;     // 0/60/90/120/180
  delta: number;     // 0..180 actual separation
  orb: number;       // abs(delta - exact)
  color: AspectColor;
};

const ASPECT_SPECS: Array<{
  type: AspectType;
  angle: number;
  orb: number;       // max allowed orb
  color: AspectColor;
}> = [
  { type: "Conjunction", angle: 0,   orb: 8, color: "gray" },
  { type: "Sextile",     angle: 60,  orb: 4, color: "blue" },
  { type: "Square",      angle: 90,  orb: 6, color: "red"  },
  { type: "Trine",       angle: 120, orb: 6, color: "blue" },
  { type: "Opposition",  angle: 180, orb: 8, color: "red"  },
];

function computeAspects(bodies: Array<{ key: BodyKey; lon: number }>): AspectLine[] {
  const lines: AspectLine[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const A = bodies[i];
      const B = bodies[j];

      const delta = smallestDeltaDeg(A.lon, B.lon);

      let best: AspectLine | null = null;

      for (const spec of ASPECT_SPECS) {
        const orb = Math.abs(delta - spec.angle);
        if (orb <= spec.orb) {
          const candidate: AspectLine = {
            a: A.key,
            b: B.key,
            type: spec.type,
            exact: spec.angle,
            delta,
            orb,
            color: spec.color,
          };
          if (!best || candidate.orb < best.orb) best = candidate;
        }
      }

      if (best) lines.push(best);
    }
  }

  // nice for drawing: tight aspects first (or reverse if you want them on top)
  return lines.sort((x, y) => x.orb - y.orb);
}

// -------- styling config --------

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

export const DEFAULT_STYLE: ChartStyle = {
  size: 800,
  backgroundColor: "#1a0033",
  starry: true,
  starCount: 300,
  primaryRingColor: "#d4af37", // Golden
  secondaryRingColor: "#8b6914", // Darker gold
  accentColor: "#ff69b4", // Pink/magenta
  zodiacTextColor: "#d4af37",
  bodyIconSize: 32,
  useGradients: true,
  glowEffect: true,
};

// -------- main --------

export function generateApproxChart({
  datetime,
  lat,
  lng
}: {
  datetime: Date;
  lat: number;
  lng: number;
}) {
  const observer = new Observer(lat, lng, 0);
  // observer is not used in this simplified ASC/MC logic (kept for later upgrades)

  // --- MC (approx)
  const sidereal = SiderealTime(datetime);
  const mc = normalizeDeg(sidereal * 15); // hours -> degrees

  // --- ASC (approx)
  const asc = normalizeDeg(mc + 90);
  const dsc = normalizeDeg(asc + 180);
  const ic = normalizeDeg(mc + 180);

  // --- equal houses (fast + stable for drawing)
  const cusps = Array.from({ length: 12 }, (_, i) =>
    normalizeDeg(asc + i * 30)
  );

  // --- planets
  const bodies = Object.entries(BODY_MAP).map(([key, body]) => {
    const vec = GeoVector(body, datetime, true);
    const ecl = Ecliptic(vec);

    const lon = normalizeDeg(ecl.elon);
    const house = houseOfLon(lon, cusps);

    return {
      key: key as BodyKey,
      lon,
      house
    };
  });

  // --- aspects (lines)
  const aspects = computeAspects(bodies.map(b => ({ key: b.key, lon: b.lon })));

  return {
    angles: { asc, mc, dsc, ic },
    houses: { cusps },
    bodies,
    aspects, // <-- draw lines using this
  };
}

// -------- GPT-friendly natal chart format --------

function degToDegStr(degInSign: number): string {
  const d = Math.floor(degInSign);
  const min = Math.round((degInSign % 1) * 60);
  return `${d}°${min.toString().padStart(2, "0")}'`;
}

const ELEMENT_BY_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};
const MODALITY_BY_SIGN: Record<string, "cardinal" | "fixed" | "mutable"> = {
  Aries: "cardinal", Taurus: "fixed", Gemini: "mutable", Cancer: "cardinal",
  Leo: "fixed", Virgo: "mutable", Libra: "cardinal", Scorpio: "fixed",
  Sagittarius: "mutable", Capricorn: "cardinal", Aquarius: "fixed", Pisces: "mutable",
};

const MAX_ASPECT_ORB = 6; // trim very loose aspects for interpretation quality
const LUMINARIES: Set<string> = new Set(["Sun", "Moon"]);

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

// -------- Astrological Symbols --------

const ZODIAC_SYMBOLS: Record<number, { name: string; image: any }> = {
  0: { name: "Aries", image: require("../assets/zodiacs/zodiacSign1.png") },
  1: { name: "Taurus", image: require("../assets/zodiacs/zodiacSign2.png") },
  2: { name: "Gemini", image: require("../assets/zodiacs/zodiacSign3.png") },
  3: { name: "Cancer", image: require("../assets/zodiacs/zodiacSign4.png") },
  4: { name: "Leo", image: require("../assets/zodiacs/zodiacSign5.png") },
  5: { name: "Virgo", image: require("../assets/zodiacs/zodiacSign6.png") },
  6: { name: "Libra", image: require("../assets/zodiacs/zodiacSign7.png") },
  7: { name: "Scorpio", image: require("../assets/zodiacs/zodiacSign8.png") },
  8: { name: "Sagittarius", image: require("../assets/zodiacs/zodiacSign9.png") },
  9: { name: "Capricorn", image: require("../assets/zodiacs/zodiacSign10.png") },
  10: { name: "Aquarius", image: require("../assets/zodiacs/zodiacSign11.png") },
  11: { name: "Pisces", image: require("../assets/zodiacs/zodiacSign12.png") },
};

const PLANET_SYMBOLS: Record<BodyKey, { symbol: string; shortName: string }> = {
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

// -------- SVG Generation with Styling --------

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 180) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function generateStarryBackground(size: number, starCount: number): string {
  let stars = "";
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 1.5;
    const opacity = Math.random() * 0.7 + 0.3;
    stars += `<circle cx="${x}" cy="${y}" r="${radius}" fill="white" opacity="${opacity}" />`;
  }
  return stars;
}

function generateSVGDefs(style: ChartStyle): string {
  return `
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#9932cc;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#ff1493;stop-opacity:0.3" />
      </linearGradient>
      <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#8b008b;stop-opacity:0.2" />
        <stop offset="100%" style="stop-color:${style.accentColor};stop-opacity:0.1" />
      </radialGradient>
    </defs>
  `;
}

export function generateStyledChart(
  chart: ReturnType<typeof generateApproxChart>,
  style: ChartStyle = DEFAULT_STYLE
): string {
  const s = { ...DEFAULT_STYLE, ...style };

  const size = s.size!;
  const center = size / 2;
  // zodiac ring: choose inner/outer so images fit but remain inside the canvas.
  // Keep a safe margin from the SVG edge so images/filters aren't clipped.
  const zodiacInner = size * 0.36; // moved slightly inward to make room
  const zodiacBandWidth = size * 0.12; // band width == zodiac image size (fits)
  const zodiacOuter = zodiacInner + zodiacBandWidth; // ~0.48 of size (keeps inside center)
  const planetSymbolSize = s.bodyIconSize!;
  const zodiacSymbolSize = Math.round(planetSymbolSize * 1.4);
  const planetMarkerR = Math.max(8, Math.round(planetSymbolSize * 0.6));
  const degFontSize = Math.max(10, Math.round(planetSymbolSize * 0.5));
  const zodiacNameFontSize = Math.max(10, Math.round(zodiacSymbolSize * 0.55));
  // Use images only when we have all 12 valid (non-empty) URIs; otherwise no fallback to emoji
  const hasZodiacUrls = Array.isArray(s.zodiacImageUrls) && s.zodiacImageUrls.length >= 12;
  const useZodiacImages = hasZodiacUrls && s.zodiacImageUrls!.every((u) => typeof u === "string" && u.length > 0);
  const zodiacImageSize = useZodiacImages ? Math.round(size * 0.105) : 0;

  const aspectInner = size * 0.28;
  const aspectOuter = size * 0.32;

  const offset = chart.angles.asc;

  // Performance toggles (default to fast on mobile)
  const perf = (s as any).performanceMode ?? true; // add to your ChartStyle if you want
  const useFilters = !!s.glowEffect && !perf;
  const useGradients = !!s.useGradients && !perf;
  const useStarry = !!s.starry && !perf;

  const planetGlowAttr = useFilters ? ` filter="url(#planetGlow)"` : "";
  const glowAttr = useFilters ? ` filter="url(#glow)"` : "";

  // Precompute constants
  const tickMajorStart = zodiacInner - 15;
  const tickMediumStart = zodiacOuter - 8;

  // Build SVG
  const svg: string[] = [];

  svg.push(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="font-family: Arial, Helvetica, sans-serif;">`,
    `<defs>`,
    // circular clip so exported image becomes a circle
    // set clip radius slightly larger than the outer zodiac ring so images/filters aren't clipped
    (() => {
      const clipR = Math.min(zodiacOuter * 1.08, center - 1);
      return `<clipPath id="circleClip"><circle cx="${center}" cy="${center}" r="${clipR}" /></clipPath>`;
    })(),
    `<style>
      .zodiac-label { font-size: ${zodiacSymbolSize}px; font-weight: bold; fill: ${s.zodiacTextColor}; }
      .house-num { font-size: 10px; fill: #999; }
      .planet-text { font-size: ${Math.max(10, degFontSize)}px; font-weight: bold; fill: ${s.zodiacTextColor}; }
      .planet-symbol { font-size: ${planetSymbolSize}px; }
    </style>`
  );

  // Only include heavy defs when needed
  if (!perf) {
    svg.push(generateSVGDefs(s).trim());
  } else {
    // Keep defs minimal (gradients/filters removed). You can add lightweight defs here if you want.
  }

  svg.push(`</defs>`);
  // Start clipped group so final image is circular
  svg.push(`<g clip-path="url(#circleClip)">`);
  // Background (will be clipped)
  svg.push(`<rect width="${size}" height="${size}" fill="${s.backgroundColor}"/>`);

  if (useStarry) {
    svg.push(generateStarryBackground(size, s.starCount!));
  }

  if (useGradients) {
    svg.push(`<rect width="${size}" height="${size}" fill="url(#starGradient)"/>`);
    svg.push(`<circle cx="${center}" cy="${center}" r="${aspectOuter * 1.5}" fill="url(#centerGradient)"/>`);
  }

  // --- ZODIAC RING ---
  svg.push(`<!-- Zodiac Ring -->`);
  svg.push(
    `<circle cx="${center}" cy="${center}" r="${zodiacOuter}" fill="none" stroke="${s.primaryRingColor}" stroke-width="3" opacity="0.8"${glowAttr}/>`,
    `<circle cx="${center}" cy="${center}" r="${zodiacOuter - 6}" fill="none" stroke="${s.secondaryRingColor}" stroke-width="1" opacity="0.5"/>`,
    `<circle cx="${center}" cy="${center}" r="${zodiacInner}" fill="none" stroke="${s.primaryRingColor}" stroke-width="2" opacity="0.8"/>`
  );

  // --- TICKS ---
  // Instead of looping 360 times, only draw medium+major ticks (every 5 degrees).
  svg.push(`<!-- Ticks -->`);
  for (let i = 0; i < 360; i += 5) {
    const isMajor = i % 30 === 0;
    const tickStart = isMajor ? tickMajorStart : tickMediumStart;
    const p1 = polarToCartesian(center, center, tickStart, i - offset);
    const p2 = polarToCartesian(center, center, zodiacOuter, i - offset);

    svg.push(
      `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${s.primaryRingColor}" stroke-width="${
        isMajor ? 2 : 0.8
      }" opacity="${isMajor ? 1 : 0.6}"/>`
    );
  }

  // --- ZODIAC LABELS (12) ---
  svg.push(`<!-- Zodiac Labels -->`);
  for (let i = 0; i < 12; i++) {
    const symbolData = ZODIAC_SYMBOLS[i];
    const midAngle = i * 30 + 15;

    const labelPos = polarToCartesian(center, center, (zodiacOuter + zodiacInner) / 2, midAngle - offset);

    if (useZodiacImages) {
      const imgW = zodiacImageSize;
      const imgH = zodiacImageSize;
      const imgX = labelPos.x - imgW / 2;
      const imgY = labelPos.y - imgH / 2;
      const uri = s.zodiacImageUrls![i];
      svg.push(
        `<image href="${uri}" xlink:href="${uri}" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" preserveAspectRatio="xMidYMid meet"/>`
      );
    } else {
      svg.push(
        `<image href="${symbolData.image}" xlink:href="${symbolData.image}" x="${labelPos.x}" y="${labelPos.y}" width="${zodiacSymbolSize}" height="${zodiacSymbolSize}" preserveAspectRatio="xMidYMid meet"/>`
      );
    }
  }

  // --- HOUSE CUSPS ---
  svg.push(`<!-- House Cusps -->`);
  // Only 12 cusps, fine as-is, but avoid filter unless enabled
  for (let i = 0; i < chart.houses.cusps.length; i++) {
    const cusp = chart.houses.cusps[i];
    const isAngle = i === 0 || i === 3 || i === 6 || i === 9;

    const p1 = polarToCartesian(center, center, aspectInner, cusp - offset);
    const p2 = polarToCartesian(center, center, zodiacInner, cusp - offset);

    svg.push(
      `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${
        isAngle ? s.accentColor : s.secondaryRingColor
      }" stroke-width="${isAngle ? 2 : 1}" opacity="${isAngle ? 0.9 : 0.5}"${
        isAngle && useFilters ? ` filter="url(#glow)"` : ""
      }/>`
    );

    const houseAngle = cusp + 15;
    const numPos = polarToCartesian(center, center, aspectInner - 15, houseAngle - offset);
    svg.push(
      `<text x="${numPos.x}" y="${numPos.y}" class="house-num" text-anchor="middle" dominant-baseline="middle">${i + 1}</text>`
    );
  }

  // --- ASPECT LINES ---
  // Optimization: build a quick lookup for bodies by key (avoid find() inside loop)
  const bodyByKey = new Map<string, { key: string; lon: number; house: number }>();
  for (const b of chart.bodies) bodyByKey.set(b.key, b);

  svg.push(`<!-- Aspect Lines -->`);
  for (const aspect of chart.aspects) {
    const b1 = bodyByKey.get(aspect.a);
    const b2 = bodyByKey.get(aspect.b);
    if (!b1 || !b2) continue;

    const p1 = polarToCartesian(center, center, aspectInner - 15, b1.lon - offset);
    const p2 = polarToCartesian(center, center, aspectInner - 15, b2.lon - offset);

    const aspectColor =
      aspect.color === "red" ? "#ff69b4" : aspect.color === "blue" ? "#87ceeb" : "#999";
    const strokeWidth = aspect.orb < 1 ? 2.5 : aspect.orb < 3 ? 1.8 : 1;

    svg.push(
      `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${aspectColor}" stroke-width="${strokeWidth}" opacity="0.7"${
        useFilters ? ` filter="url(#glow)"` : ""
      }/>`
    );
  }

  // --- PLANETS/BODIES ---
  svg.push(`<!-- Planets/Bodies -->`);
  const bodyRadius = zodiacInner - 40;

  for (const body of chart.bodies) {
    const planetSym = PLANET_SYMBOLS[body.key];
    const p = polarToCartesian(center, center, bodyRadius, body.lon - offset);

    svg.push(`<circle cx="${p.x}" cy="${p.y}" r="${planetMarkerR}" fill="${s.accentColor}" opacity="0.3"${planetGlowAttr}/>`);
    svg.push(
      `<text x="${p.x}" y="${p.y + 3}" class="planet-symbol" font-size="${planetSymbolSize}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="${s.zodiacTextColor}"${planetGlowAttr}>${planetSym.symbol}</text>`
    );

    // Degree (clearly visible next to planet)
    const deg = Math.floor(body.lon % 30);
    const degPos = polarToCartesian(center, center, bodyRadius + 22, body.lon - offset);
    svg.push(
      `<text x="${degPos.x}" y="${degPos.y}" class="planet-text" text-anchor="middle" dominant-baseline="middle" font-size="${degFontSize}" font-weight="bold" fill="${s.zodiacTextColor}">${deg}°</text>`
    );
  }

  // --- ANGLES LABELS ---
  svg.push(`<!-- Angles -->`);
  const angles = [
    { name: "ASC", angle: 0 },
    { name: "MC", angle: 90 },
    { name: "DSC", angle: 180 },
    { name: "IC", angle: 270 },
  ];

  for (const a of angles) {
    const anglePos = polarToCartesian(center, center, zodiacOuter + 30, a.angle - offset);
    svg.push(
      `<text x="${anglePos.x}" y="${anglePos.y}" style="font-size: 14px; font-weight: bold; fill: ${s.accentColor};${
        useFilters ? " filter: url(#glow);" : ""
      }" text-anchor="middle" dominant-baseline="middle">${a.name}</text>`
    );
  }

  // Center point
  svg.push(`<circle cx="${center}" cy="${center}" r="3" fill="${s.primaryRingColor}"${planetGlowAttr}/>`);
  // end clipped group
  svg.push(`</g>`);
  // outer circle border for the picture
  svg.push(`<circle cx="${center}" cy="${center}" r="${zodiacOuter * 1.05}" fill="none" stroke="${s.primaryRingColor}" stroke-width="3" opacity="0.9"/>`);
  svg.push(`</svg>`);

  return svg.join("\n");
}
