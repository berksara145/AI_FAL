/**
 * Standalone test for natal chart generation
 * Tests the chart generation logic without database dependencies
 */

import { generateApproxChart, generateStyledChart, DEFAULT_STYLE } from "./natalChart";
import type { ChartStyleConfig, BirthData, NatalChartData } from "../types/natalChart";

// Build chart data from sample data
function buildChartDataFromSample(): NatalChartData {
  const birthData: BirthData = {
    name: "Test User",
    birthDate: new Date(2002, 10, 12, 18, 45, 0), // Nov 12, 2002, 18:45
    birthTime: { hour: 18, minute: 45 },
    birthLocation: {
      placeName: "Istanbul, Turkey",
      placeId: "turkey-istanbul",
      latitude: 41.0082,
      longitude: 28.9784,
    },
  };

  // Generate raw astrological data
  const rawChart = generateApproxChart({
    datetime: birthData.birthDate,
    lat: birthData.birthLocation.latitude,
    lng: birthData.birthLocation.longitude,
  });

  // Format planet positions
  const ZODIAC_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  const PLANET_SYMBOLS: Record<string, string> = {
    Sun: "☉",
    Moon: "☽",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Uranus: "♅",
    Neptune: "♆",
    Pluto: "♇",
  };

  const planets = rawChart.bodies.map((body) => {
    const signIndex = Math.floor(body.lon / 30);
    const degree = Math.floor(body.lon % 30);

    return {
      bodyKey: body.key,
      symbol: PLANET_SYMBOLS[body.key] || body.key.substring(0, 2),
      longitude: body.lon,
      house: body.house,
      degree,
      sign: ZODIAC_NAMES[signIndex],
    };
  });

  // Format aspects
  const aspects = rawChart.aspects.map((aspect) => ({
    planet1: aspect.a,
    planet2: aspect.b,
    type: aspect.type as "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition",
    angle: aspect.exact,
    orb: aspect.orb,
    color: aspect.color,
  }));

  return {
    birthData,
    angles: {
      asc: rawChart.angles.asc,
      mc: rawChart.angles.mc,
      dsc: rawChart.angles.dsc,
      ic: rawChart.angles.ic,
    },
    houses: { cusps: rawChart.houses.cusps },
    planets,
    aspects,
    generatedAt: new Date(),
  };
}

async function testChartGeneration() {
  try {
    console.log("=== Natal Chart Generation Test ===\n");

    // Step 1: Build chart data
    console.log("1. Building natal chart data...");
    const chartData = buildChartDataFromSample();
    console.log(`   Planets: ${chartData.planets.length}`);
    console.log(`   Aspects: ${chartData.aspects.length}`);

    // Step 2: Generate styled SVG
    console.log("\n2. Generating styled SVG...");
    const chartStyle: ChartStyleConfig = {
      size: 1000,
      backgroundColor: "#0a0015",
      starry: true,
      starCount: 400,
      primaryRingColor: "#d4af37",
      secondaryRingColor: "#8b6914",
      accentColor: "#ff1493",
      zodiacTextColor: "#ffd700",
      bodyIconSize: 20,
      useGradients: true,
      glowEffect: true,
    };

    // Prepare data for chart generation
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
        delta: 0,
        orb: a.orb,
        color: a.color,
      })),
    };

    const svgContent = generateStyledChart(rawChart, chartStyle);
    console.log(`   SVG generated: ${(svgContent.length / 1024).toFixed(2)} KB`);

    // Step 3: Display chart summary
    console.log("\n3. Chart Data Summary:");
    console.log(`   Birth: ${chartData.birthData.name}`);
    console.log(`   Date: ${chartData.birthData.birthDate.toDateString()}`);
    console.log(`   Time: ${chartData.birthData.birthTime.hour}:${chartData.birthData.birthTime.minute.toString().padStart(2, "0")}`);
    console.log(`   Location: ${chartData.birthData.birthLocation.placeName}`);

    // Step 4: Show angles
    console.log("\n4. Angles:");
    console.log(`   ASC: ${chartData.angles.asc.toFixed(2)}°`);
    console.log(`   MC:  ${chartData.angles.mc.toFixed(2)}°`);
    console.log(`   DSC: ${chartData.angles.dsc.toFixed(2)}°`);
    console.log(`   IC:  ${chartData.angles.ic.toFixed(2)}°`);

    // Step 5: Show planets
    console.log("\n5. Planets in Houses:");
    chartData.planets.forEach((planet) => {
      console.log(
        `   ${planet.symbol} ${planet.bodyKey}: ${planet.sign} ${planet.degree}° (House ${planet.house})`
      );
    });

    // Step 6: Show aspects
    console.log("\n6. Top Aspects:");
    chartData.aspects.slice(0, 5).forEach((aspect) => {
      console.log(
        `   ${aspect.planet1} ${aspect.type} ${aspect.planet2} (orb: ${aspect.orb.toFixed(2)}°)`
      );
    });

    // Step 7: Save SVG
    console.log("\n7. Saving SVG...");
    const fs = await import("fs");
    fs.writeFileSync("./natal_chart_test.svg", svgContent);
    console.log("   Chart saved to: natal_chart_test.svg");

    console.log("\n=== Test Completed Successfully ===");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testChartGeneration();
