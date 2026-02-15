/**
 * Test natal chart GPT format – generate chart and output the GPT-friendly JSON.
 * Run: npm run test:chart-gpt  (from project root)
 */

import * as fs from "fs";
import * as path from "path";
import { generateApproxChart, generateChartForGpt } from "./natalChart";

const PLACES = [
  { name: "Istanbul, Turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "New York, USA", lat: 40.7128, lng: -74.006 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Generate one random person's birth data for testing. */
function generateRandomPersonBirthData(): {
  birthDate: Date;
  placeName: string;
  lat: number;
  lng: number;
} {
  const year = randomInt(1970, 2010);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  const hour = randomInt(0, 23);
  const minute = randomInt(0, 59);
  const place = randomItem(PLACES);
  const birthDate = new Date(year, month - 1, day, hour, minute, 0);
  return {
    birthDate,
    placeName: place.name,
    lat: place.lat,
    lng: place.lng,
  };
}

function runTest() {
  const outDir = path.join(__dirname, "test-output");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const jsonPath = path.join(outDir, "natal-chart-gpt.json");

  console.log("=== Natal Chart GPT Format Test ===\n");

  const birth = generateRandomPersonBirthData();
  console.log("1. Random birth data:");
  console.log(`   Birth: ${birth.birthDate.toISOString().slice(0, 16)}Z`);
  console.log(`   Place: ${birth.placeName} (${birth.lat}, ${birth.lng})`);

  console.log("\n2. Generating raw chart...");
  const rawChart = generateApproxChart({
    datetime: birth.birthDate,
    lat: birth.lat,
    lng: birth.lng,
  });
  console.log(`   Bodies: ${rawChart.bodies.length}, Aspects: ${rawChart.aspects.length}`);

  console.log("\n3. Building GPT format...");
  const gptFormat = generateChartForGpt(rawChart, birth.placeName);
  const jsonStr = JSON.stringify(gptFormat, null, 2);

  console.log("\n4. GPT format (preview):");
  console.log(jsonStr.slice(0, 1200) + (jsonStr.length > 1200 ? "\n   ..." : ""));

  console.log("\n5. Saving JSON...");
  fs.writeFileSync(jsonPath, jsonStr, "utf8");
  console.log(`   Saved: ${jsonPath}`);

  console.log("\n=== Done ===");
}

runTest();
