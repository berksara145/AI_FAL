/**
 * Test natal chart "beauty" – one random person, generate chart and save image.
 * Uses assets/zodiacs/zodiacSign1.png..zodiacSign12.png as data URIs so the SVG shows images.
 * Run: npm run test:chart-beauty  (from project root)
 */

import * as fs from "fs";
import * as path from "path";
import { generateApproxChart, generateStyledChart, DEFAULT_STYLE } from "./natalChart";
import type { ChartStyle } from "./natalChart";

const ASSETS_ZODIACS = path.join(__dirname, "..", "assets", "zodiacs");

/** Load 12 zodiac PNGs from assets/zodiacs and return as data URIs (order: Aries..Pisces). */
function loadZodiacImageUrls(): string[] {
  const urls: string[] = [];
  for (let i = 1; i <= 12; i++) {
    const filePath = path.join(ASSETS_ZODIACS, `zodiacSign${i}.png`);
    if (!fs.existsSync(filePath)) {
      console.warn(`   Missing: ${filePath}`);
      urls.push("");
      continue;
    }
    const buf = fs.readFileSync(filePath);
    const base64 = buf.toString("base64");
    urls.push(`data:image/png;base64,${base64}`);
  }
  return urls;
}

const PLACES = [
  { name: "Istanbul, Turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "New York, USA", lat: 40.7128, lng: -74.006 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Mumbai, India", lat: 19.076, lng: 72.8777 },
  { name: "Berlin, Germany", lat: 52.52, lng: 13.405 },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Generate one random person's birth data for testing. */
function generateRandomPersonBirthData(): {
  name: string;
  birthDate: Date;
  hour: number;
  minute: number;
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
  const names = ["Alex", "Sam", "Jordan", "Riley", "Morgan", "Casey", "Avery", "Quinn"];
  const name = randomItem(names);
  return {
    name,
    birthDate,
    hour,
    minute,
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
  const svgPath = path.join(outDir, "natal-chart-beauty.svg");

  console.log("=== Natal Chart Beauty Test ===\n");

  const birth = generateRandomPersonBirthData();
  console.log("1. Random person:");
  console.log(`   Name: ${birth.name}`);
  console.log(`   Birth: ${birth.birthDate.toISOString().slice(0, 10)} ${birth.hour}:${birth.minute.toString().padStart(2, "0")}`);
  console.log(`   Place: ${birth.placeName} (${birth.lat}, ${birth.lng})`);

  console.log("\n2. Loading zodiac images from assets/zodiacs...");
  const zodiacImageUrls = loadZodiacImageUrls();
  const loaded = zodiacImageUrls.filter((u) => u.length > 0).length;
  console.log(`   Loaded ${loaded}/12 images as data URIs`);

  console.log("\n3. Generating chart...");
  const rawChart = generateApproxChart({
    datetime: birth.birthDate,
    lat: birth.lat,
    lng: birth.lng,
  });
  console.log(`   Bodies: ${rawChart.bodies.length}, Aspects: ${rawChart.aspects.length}`);

  const style: ChartStyle = {
    ...DEFAULT_STYLE,
    size: 800,
    bodyIconSize: 36,
    zodiacImageUrls: loaded === 12 ? zodiacImageUrls : undefined,
  };
  const svgContent = generateStyledChart(rawChart, style);
  console.log(`   SVG length: ${(svgContent.length / 1024).toFixed(2)} KB`);

  console.log("\n4. Saving image...");
  fs.writeFileSync(svgPath, svgContent, "utf8");
  console.log(`   Saved: ${svgPath}`);

  console.log("\n=== Done ===");
}

runTest();
