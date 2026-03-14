/**
 * Natal Chart Service
 * Handles the generation, storage, and retrieval of natal charts
 * Integrates astrological calculations with the application database
 */

import { generateApproxChart, generateStyledChart, generateChartForGpt, DEFAULT_STYLE, ChartStyle, ZODIAC_SYMBOLS, PLANET_SYMBOLS as PLANET_SYMBOL_MAP } from "./natalChart";
import { birthPlaceLocalToUTC } from "../lib/birthTimeUtils";
import { getOrCreateUser } from "../db/user.repo";
import { upsertPersonWithChart, getPersonByName, Person } from "../db/person.repo";
import type { User } from "../db/user.repo";
import type {
  BirthData,
  NatalChartData,
  PlanetPosition,
  AspectData,
  AngleData,
  HouseData,
  ChartStyleConfig,
  GeneratedChart,
} from "../types/natalChart";

/**
 * Build BirthData object from User database record
 */
export const buildBirthDataFromUser = (user: User): BirthData => {
  console.log("[buildBirthDataFromUser] Validating birth data fields...");
  console.log("[buildBirthDataFromUser] birth_year:", user.birth_year, "birth_month:", user.birth_month, "birth_day:", user.birth_day);
  console.log("[buildBirthDataFromUser] birth_hour:", user.birth_hour, "birth_minute:", user.birth_minute);
  console.log("[buildBirthDataFromUser] birth_lat:", user.birth_lat, "birth_lng:", user.birth_lng);
  console.log("[buildBirthDataFromUser] birth_place_name:", user.birth_place_name);

  // Ensure we have all required birth data
  if (
    !user.birth_year ||
    !user.birth_month ||
    !user.birth_day ||
    user.birth_hour === null ||
    user.birth_minute === null ||
    !user.birth_lat ||
    !user.birth_lng ||
    !user.birth_place_name
  ) {
    const missing = [];
    if (!user.birth_year) missing.push("birth_year");
    if (!user.birth_month) missing.push("birth_month");
    if (!user.birth_day) missing.push("birth_day");
    if (user.birth_hour === null) missing.push("birth_hour");
    if (user.birth_minute === null) missing.push("birth_minute");
    if (!user.birth_lat) missing.push("birth_lat");
    if (!user.birth_lng) missing.push("birth_lng");
    if (!user.birth_place_name) missing.push("birth_place_name");
    
    const errorMsg = `[buildBirthDataFromUser] ❌ Incomplete birth data. Missing: ${missing.join(", ")}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (user.birth_month! < 1 || user.birth_month! > 12) {
    throw new Error(`[buildBirthDataFromUser] Invalid birth_month (must be 1-12): ${user.birth_month}`);
  }
  console.log("[buildBirthDataFromUser] ✅ All fields present, creating UTC Date from birth-place local time...");
  const birthDate = birthPlaceLocalToUTC({
    year: user.birth_year,
    month: user.birth_month,
    day: user.birth_day,
    hour: user.birth_hour,
    minute: user.birth_minute,
    longitude: user.birth_lng,
  });
  console.log("[buildBirthDataFromUser] ✅ Birth date (UTC):", birthDate.toISOString());

  const birthData: BirthData = {
    name: user.name || undefined,
    birthDate,
    birthTime: {
      hour: user.birth_hour,
      minute: user.birth_minute,
    },
    birthLocation: {
      placeName: user.birth_place_name,
      placeId: user.birth_place_id || "",
      latitude: user.birth_lat,
      longitude: user.birth_lng,
    },
  };

  console.log("[buildBirthDataFromUser] ✅ BirthData object created successfully");
  return birthData;
};

/**
 * Build BirthData object from a Person database record
 */
export const buildBirthDataFromPerson = (person: Person): BirthData => {
  console.log("[buildBirthDataFromPerson] Validating person birth data fields...", person);

  if (
    !person.birth_year ||
    !person.birth_month ||
    !person.birth_day ||
    person.birth_hour === null ||
    person.birth_minute === null ||
    !person.birth_lat ||
    !person.birth_lng ||
    !person.birth_place_name
  ) {
    const missing = [];
    if (!person.birth_year) missing.push("birth_year");
    if (!person.birth_month) missing.push("birth_month");
    if (!person.birth_day) missing.push("birth_day");
    if (person.birth_hour === null) missing.push("birth_hour");
    if (person.birth_minute === null) missing.push("birth_minute");
    if (!person.birth_lat) missing.push("birth_lat");
    if (!person.birth_lng) missing.push("birth_lng");
    if (!person.birth_place_name) missing.push("birth_place_name");

    const errorMsg = `[buildBirthDataFromPerson] ❌ Incomplete person birth data. Missing: ${missing.join(", ")}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (person.birth_month! < 1 || person.birth_month! > 12) {
    throw new Error(`[buildBirthDataFromPerson] Invalid birth_month (must be 1-12): ${person.birth_month}`);
  }
  const birthDate = birthPlaceLocalToUTC({
    year: person.birth_year!,
    month: person.birth_month!,
    day: person.birth_day!,
    hour: person.birth_hour!,
    minute: person.birth_minute!,
    longitude: person.birth_lng!,
  });

  const birthData: BirthData = {
    name: person.name || undefined,
    birthDate,
    birthTime: {
      hour: person.birth_hour!,
      minute: person.birth_minute!,
    },
    birthLocation: {
      placeName: person.birth_place_name!,
      placeId: person.birth_place_id || "",
      latitude: person.birth_lat!,
      longitude: person.birth_lng!,
    },
  };

  console.log("[buildBirthDataFromPerson] ✅ BirthData created for person:", person.name);
  return birthData;
};

/**
 * Convert raw astrological calculations to formatted PlanetPosition array
 */
const formatPlanetPositions = (
  bodies: Array<{ key: string; lon: number; house: number }>
): PlanetPosition[] => {
  return bodies.map((body) => {
    const signIndex = Math.floor(body.lon / 30);
    const degree = Math.floor(body.lon % 30);
    const symbolEntry = PLANET_SYMBOL_MAP[body.key as keyof typeof PLANET_SYMBOL_MAP];

    return {
      bodyKey: body.key,
      symbol: symbolEntry?.symbol ?? body.key.substring(0, 2),
      longitude: body.lon,
      house: body.house,
      degree,
      sign: ZODIAC_SYMBOLS[signIndex]?.name ?? "",
    };
  });
};

/**
 * Convert raw aspect data to formatted AspectData array
 */
const formatAspects = (
  aspects: Array<{
    a: string;
    b: string;
    type: string;
    exact: number;
    delta: number;
    orb: number;
    color: "red" | "blue" | "gray";
  }>
): AspectData[] => {
  return aspects.map((aspect) => ({
    planet1: aspect.a,
    planet2: aspect.b,
    type: aspect.type as "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition",
    angle: aspect.exact,
    orb: aspect.orb,
    color: aspect.color,
  }));
};

/**
 * Generate natal chart from user's birth data stored in database
 */
export const generateNatalChartFromUserData = async (personName?: string): Promise<NatalChartData> => {
  try {
    console.log("[natalChartService] 1️⃣ Starting generateNatalChartFromUserData...", { personName });

    let birthData;
    if (personName) {
      console.log("[natalChartService] 2️⃣ Fetching person from database:", personName);
      const person = await getPersonByName(personName);
      if (!person) {
        throw new Error(`Person not found: ${personName}`);
      }
      birthData = buildBirthDataFromPerson(person);
      console.log("[natalChartService] ✅ Person birth data built:", birthData);
    } else {
      // Enforce using persons table only
      const errMsg = "[natalChartService] ❌ personName is required. This function only reads from the persons table.";
      console.error(errMsg);
      throw new Error("personName is required. Use getPersonByName / persons table for birth data.");
    }

    // Generate astrological calculations
    console.log("[natalChartService] 4️⃣ Generating astrological calculations...");
    const rawChart = generateApproxChart({
      datetime: birthData.birthDate,
      lat: birthData.birthLocation.latitude,
      lng: birthData.birthLocation.longitude,
    });
    console.log("[natalChartService] ✅ Astrological calculations complete");

    // Format the data into readable structures
    console.log("[natalChartService] 5️⃣ Formatting planet positions and aspects...");
    const planets = formatPlanetPositions(rawChart.bodies);
    const aspects = formatAspects(rawChart.aspects);
    console.log("[natalChartService] ✅ Formatted - Planets:", planets.length, "Aspects:", aspects.length);

    const angles: AngleData = {
      asc: rawChart.angles.asc,
      mc: rawChart.angles.mc,
      dsc: rawChart.angles.dsc,
      ic: rawChart.angles.ic,
    };

    const houses: HouseData = {
      cusps: rawChart.houses.cusps,
    };

    console.log("[natalChartService] 6️⃣ Creating NatalChartData object...");
    const chartData = {
      birthData,
      angles,
      houses,
      planets,
      aspects,
      generatedAt: new Date(),
      rawChart,
    };
    console.log("[natalChartService] ✅ NatalChartData created successfully");

    return chartData;
  } catch (error) {
    console.error("[natalChartService] ❌ CRITICAL ERROR in generateNatalChartFromUserData:", error);
    console.error("[natalChartService] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

/**
 * Create styled SVG chart from natal chart data
 */
const createStyledChart = (chartData: NatalChartData, style?: ChartStyleConfig): string => {
  // Convert NatalChartData back to the format expected by generateStyledChart
  const rawChart = {
    angles: chartData.angles,
    houses: chartData.houses,
    bodies: chartData.planets.map((p) => ({
      key: p.bodyKey as any,
      lon: p.longitude,
      house: p.house,
    })),
    aspects: chartData.aspects.map((a) => ({
      a: a.planet1 as any,
      b: a.planet2 as any,
      type: a.type,
      exact: a.angle,
      delta: 0, // Not critical for styling
      orb: a.orb,
      color: a.color,
    })),
  };

  const chartStyle: ChartStyle = {
    ...DEFAULT_STYLE,
    ...style,
  };

  return generateStyledChart(rawChart, chartStyle);
};

/**
 * Full workflow: Generate natal chart and save as SVG
 */
export const generateAndSaveNatalChart = async (
  customStyle?: ChartStyleConfig,
  outputPath?: string,
  personName?: string
): Promise<GeneratedChart> => {
  try {
    console.log("[generateAndSaveNatalChart] 🚀 START - customStyle:", !!customStyle, "outputPath:", outputPath);

    // Generate chart data (optionally for a specific person)
    console.log("[generateAndSaveNatalChart] 📊 Calling generateNatalChartFromUserData()...", { personName });
    const chartData = await generateNatalChartFromUserData(personName);
    console.log("[generateAndSaveNatalChart] ✅ Chart data received");

    console.log("[generateAndSaveNatalChart] 📈 Chart stats:", {
      birthData: chartData.birthData,
      planetsCount: chartData.planets.length,
      aspectsCount: chartData.aspects.length,
    });

    // Generate styled SVG
    console.log("[generateAndSaveNatalChart] 🎨 Generating styled SVG...");
    const svgContent = createStyledChart(chartData, customStyle);
    console.log("[generateAndSaveNatalChart] ✅ SVG created, size:", (svgContent.length / 1024).toFixed(2), "KB");

    
    // Build GPT-friendly natal chart JSON and print once in pipeline
    const rawChart = (chartData as NatalChartData & { rawChart?: ReturnType<typeof generateApproxChart> }).rawChart;
    let chartGptJson: string | null = null;
    if (rawChart) {
      const gptFormat = generateChartForGpt(rawChart, chartData.birthData.birthLocation.placeName);
      chartGptJson = JSON.stringify(gptFormat, null, 2);
      console.log("[generateAndSaveNatalChart] Natal chart (GPT format):", chartGptJson);
    }

    // Persist chart metadata and SVG into persons table. Use stored birth date (ISO triple 1-12) so we never overwrite with UTC components.
    const finalPersonName = personName ?? chartData.birthData.name ?? null;
    if (!finalPersonName) {
      console.warn("[generateAndSaveNatalChart] No person name; skipping DB upsert");
    } else {
      try {
        const person = await getPersonByName(finalPersonName);
        if (!person) throw new Error(`Person not found: ${finalPersonName}`);
        const styleJson = JSON.stringify(customStyle || DEFAULT_STYLE);
        const generatedAtIso = new Date().toISOString();
        await upsertPersonWithChart({
          name: finalPersonName,
          birth_year: person.birth_year!,
          birth_month: person.birth_month!,
          birth_day: person.birth_day!,
          birth_hour: person.birth_hour!,
          birth_minute: person.birth_minute!,
          birth_place_name: chartData.birthData.birthLocation.placeName,
          birth_place_id: chartData.birthData.birthLocation.placeId || null,
          birth_lat: chartData.birthData.birthLocation.latitude,
          birth_lng: chartData.birthData.birthLocation.longitude,
          svg_content: svgContent,
          png_path: null,
          style: styleJson,
          chart_gpt_json: chartGptJson,
          generated_at: generatedAtIso,
        });
        console.log("[generateAndSaveNatalChart] ✅ Saved SVG and chart_gpt_json to persons table for", finalPersonName);
      } catch (dbErr) {
        console.error("[generateAndSaveNatalChart] ❌ Failed to save chart to persons table:", dbErr);
      }
    }

    return {
      svgContent,
      chartData,
      style: customStyle || DEFAULT_STYLE,
    };
  } catch (error) {
    console.error("[generateAndSaveNatalChart] ❌ CRITICAL ERROR:", error);
    console.error("[generateAndSaveNatalChart] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[generateAndSaveNatalChart] Full error object:", error);
    throw error;
  }
};

/**
 * Store chart result in message/session for reference
 */
export const formatChartDataForDisplay = (chart: GeneratedChart): {
  summary: string;
  details: string;
} => {
  const { birthData, planets, aspects } = chart.chartData;

  const summary = `
Birth Chart for ${birthData.name || "User"}
Generated: ${new Date(chart.chartData.generatedAt).toLocaleDateString()}
Location: ${birthData.birthLocation.placeName}
Time: ${birthData.birthTime.hour.toString().padStart(2, "0")}:${birthData.birthTime.minute.toString().padStart(2, "0")}
  `;

  const planetsList = planets.map((p) => `${p.symbol} ${p.bodyKey} in ${p.sign} (${p.degree}°)`).join("\n");
  const aspectsList = aspects
    .slice(0, 5) // Show top 5 aspects
    .map((a) => `${a.planet1} ${a.type} ${a.planet2} (orb: ${a.orb.toFixed(2)}°)`)
    .join("\n");

  const details = `
Planets:
${planetsList}

Key Aspects:
${aspectsList}
  `;

  return { summary, details };
};
