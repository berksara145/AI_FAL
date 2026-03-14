import {
  Body,
  GeoVector,
  Observer,
  Ecliptic,
  SiderealTime,
} from "astronomy-engine";
import type { AspectLine, BodyKey } from "./types";

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

export function normalizeDeg(x: number) {
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

const ASPECT_SPECS: Array<{
  type: AspectLine["type"];
  angle: number;
  orb: number; // max allowed orb
  color: AspectLine["color"];
}> = [
  { type: "Conjunction", angle: 0, orb: 8, color: "gray" },
  { type: "Sextile", angle: 60, orb: 4, color: "blue" },
  { type: "Square", angle: 90, orb: 6, color: "red" },
  { type: "Trine", angle: 120, orb: 6, color: "blue" },
  { type: "Opposition", angle: 180, orb: 8, color: "red" },
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

export function generateApproxChart({
  datetime,
  lat,
  lng,
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
  const cusps = Array.from({ length: 12 }, (_, i) => normalizeDeg(asc + i * 30));

  // --- planets
  const bodies = Object.entries(BODY_MAP).map(([key, body]) => {
    const vec = GeoVector(body, datetime, true);
    const ecl = Ecliptic(vec);

    const lon = normalizeDeg(ecl.elon);
    const house = houseOfLon(lon, cusps);

    return {
      key: key as BodyKey,
      lon,
      house,
    };
  });

  // --- aspects (lines)
  const aspects = computeAspects(bodies.map((b) => ({ key: b.key, lon: b.lon })));

  return {
    angles: { asc, mc, dsc, ic },
    houses: { cusps },
    bodies,
    aspects, // <-- draw lines using this
  };
}

