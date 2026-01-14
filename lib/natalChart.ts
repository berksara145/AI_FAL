// utils/natalChart.ts
import * as Astronomy from "astronomy-engine";
import { DateTime } from "luxon";

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export type Big3Data = {
  ascendant: { absoluteDeg: number; sign: ZodiacSign; signDeg: number; label: "ASC" };
  sun: { absoluteDeg: number; sign: ZodiacSign; signDeg: number; label: "Sun" };
  moon: { absoluteDeg: number; sign: ZodiacSign; signDeg: number; label: "Moon" };
};

export type NatalChartMeta = {
  utcDatetime: string;
  julianDayUT: number;
  engine: "astronomy-engine";
  version: 1;
  timezone: string;
};

export type NatalChartData = {
  meta: NatalChartMeta;
  big3: Big3Data;
};

function norm360(deg: number): number {
  let x = deg % 360;
  if (x < 0) x += 360;
  return x;
}

function degreesToZodiac(absoluteDeg: number): { sign: ZodiacSign; signDeg: number } {
  const normalized = norm360(absoluteDeg);
  const signIndex = Math.floor(normalized / 30);
  const signDeg = normalized % 30;
  return { sign: ZODIAC_SIGNS[signIndex], signDeg };
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Local Sidereal Time (degrees), longitude east-positive.
 *
 * astronomy-engine:
 *   AstroTime.SiderealTime() -> Greenwich apparent sidereal time in HOURS.
 */
function localSiderealTimeDegrees(time: Astronomy.AstroTime, longitudeDeg: number): number {
  const gastHours = time.SiderealTime(); // ✅ correct method
  const lstHours = gastHours + longitudeDeg / 15.0;

  // Convert hours -> degrees, normalize
  return norm360((lstHours % 24) * 15.0);
}

/**
 * Ascendant (ecliptic longitude) in degrees [0..360).
 *
 * Uses:
 *  θ = local sidereal time
 *  φ = latitude
 *  ε = obliquity of the ecliptic
 */
function calculateAscendant(
  time: Astronomy.AstroTime,
  latitudeDeg: number,
  longitudeDeg: number
): number {
  const thetaDeg = localSiderealTimeDegrees(time, longitudeDeg);
  const theta = toRad(thetaDeg);
  const phi = toRad(latitudeDeg);

  // ✅ Correct function name in astronomy-engine:
  // Returns degrees.
  const epsDeg = Astronomy.Obliquity(time);
  const eps = toRad(epsDeg);

  // λ = atan2( sinθ * cosε + tanφ * sinε, cosθ )
  const y = Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  const x = Math.cos(theta);

  return norm360(toDeg(Math.atan2(y, x)));
}

function getEclipticLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  // ✅ Ecliptic() exists and returns {elon, elat}
  const ecl = Astronomy.Ecliptic(body, time);
  return norm360(ecl.elon);
}

export function calculateNatalChartBig3(params: {
  birthDate: string; // "YYYY-MM-DD"
  birthTime: { hour: number; minute: number };
  timezone: string; // "Europe/Istanbul"
  location: { lat: number; lng: number }; // lng east-positive
}): NatalChartData {
  const { birthDate, birthTime, timezone, location } = params;

  // Build local time in the given IANA timezone
  const local = DateTime.fromISO(birthDate, { zone: timezone }).set({
    hour: birthTime.hour,
    minute: birthTime.minute,
    second: 0,
    millisecond: 0,
  });

  if (!local.isValid) {
    throw new Error(`Invalid datetime/timezone: ${local.invalidReason ?? "unknown"}`);
  }

  // Convert to UTC for astronomy-engine
  const utc = local.toUTC();
  const utcDate = utc.toJSDate();

  const time = new Astronomy.AstroTime(utcDate);

  // JD(UT) = 2451545.0 + time.ut  (ut is days since J2000)
  const julianDayUT = 2451545.0 + time.ut;

  const sunAbs = getEclipticLongitude(Astronomy.Body.Sun, time);
  const moonAbs = getEclipticLongitude(Astronomy.Body.Moon, time);
  const ascAbs = calculateAscendant(time, location.lat, location.lng);

  const sunZ = degreesToZodiac(sunAbs);
  const moonZ = degreesToZodiac(moonAbs);
  const ascZ = degreesToZodiac(ascAbs);

  return {
    meta: {
      utcDatetime:
        utc.toISO({ suppressMilliseconds: true }) ?? utcDate.toISOString(),
      julianDayUT,
      engine: "astronomy-engine",
      version: 1,
      timezone,
    },
    big3: {
      ascendant: { absoluteDeg: ascAbs, sign: ascZ.sign, signDeg: ascZ.signDeg, label: "ASC" },
      sun: { absoluteDeg: sunAbs, sign: sunZ.sign, signDeg: sunZ.signDeg, label: "Sun" },
      moon: { absoluteDeg: moonAbs, sign: moonZ.sign, signDeg: moonZ.signDeg, label: "Moon" },
    },
  };
}
