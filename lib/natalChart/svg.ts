import type { ChartStyle } from "./types";
import { DEFAULT_STYLE } from "./types";
import { ZODIAC_SYMBOLS, PLANET_SYMBOLS } from "./symbols";
import { generateApproxChart } from "./core";

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
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="font-family: Arial, Helvetica, sans-serif;">`,
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
    const midAngle = i * 30 + 15;

    const labelPos = polarToCartesian(center, center, (zodiacOuter + zodiacInner) / 2, midAngle - offset);

    const circleR = Math.round(zodiacBandWidth * 0.36);
    svg.push(
      `<circle cx="${labelPos.x}" cy="${labelPos.y}" r="${circleR}" fill="${s.accentColor}" opacity="0.15"/>`,
      `<circle cx="${labelPos.x}" cy="${labelPos.y}" r="${circleR}" fill="none" stroke="${s.accentColor}" stroke-width="1.5" opacity="0.8"/>`
    );
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

