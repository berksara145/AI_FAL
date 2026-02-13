/**
 * Test script for natal chart service integration
 * Simulates the complete flow: birth data -> chart generation -> storage
 * 
 * Note: This tests the core service logic. React Native UI integration
 * happens in BirthMapChatWrapper.tsx
 */

import { generateAndSaveNatalChart, formatChartDataForDisplay } from "./natalChartService";
import { getOrCreateUser, updateBirthDate, updateBirthTime, updateBirthLocation } from "../db/user.repo";
import type { ChartStyleConfig } from "../types/natalChart";

async function testNatalChartIntegration() {
  try {
    console.log("=== Natal Chart Integration Test ===\n");

    // Step 1: Setup user data
    console.log("1. Setting up user birth data...");
    const user = await getOrCreateUser();
    console.log(`   User ID: ${user.id}`);

    // Update user with birth data
    await updateBirthDate(2002, 11, 12); // Nov 12, 2002
    await updateBirthTime(18, 45); // 18:45
    await updateBirthLocation({
      placeName: "Istanbul, Turkey",
      placeId: "turkey-istanbul",
      lat: 41.0082,
      lng: 28.9784,
    });
    console.log("   Birth data saved to database");

    // Step 2: Generate natal chart
    console.log("\n2. Generating natal chart...");
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

    const chart = await generateAndSaveNatalChart(chartStyle);
    console.log("   Chart generated successfully!");
    console.log(`   Planets: ${chart.chartData.planets.length}`);
    console.log(`   Aspects: ${chart.chartData.aspects.length}`);

    // Step 3: Display formatted data
    console.log("\n3. Chart Summary:");
    const { summary, details } = formatChartDataForDisplay(chart);
    console.log(summary);
    console.log(details);

    // Step 4: Show chart data structure
    console.log("\n4. Detailed Chart Data:");
    console.log("   Angles:");
    console.log(`     ASC: ${chart.chartData.angles.asc.toFixed(2)}°`);
    console.log(`     MC:  ${chart.chartData.angles.mc.toFixed(2)}°`);
    console.log(`     DSC: ${chart.chartData.angles.dsc.toFixed(2)}°`);
    console.log(`     IC:  ${chart.chartData.angles.ic.toFixed(2)}°`);

    console.log("\n   Planets in Houses:");
    chart.chartData.planets.forEach((planet) => {
      console.log(
        `     ${planet.symbol} ${planet.bodyKey}: ${planet.sign} ${planet.degree}° (House ${planet.house})`
      );
    });

    console.log("\n   Top Aspects:");
    chart.chartData.aspects.slice(0, 5).forEach((aspect) => {
      console.log(
        `     ${aspect.planet1} ${aspect.type} ${aspect.planet2} (orb: ${aspect.orb.toFixed(2)}°)`
      );
    });

    console.log("\n=== Test Completed Successfully ===");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testNatalChartIntegration();
