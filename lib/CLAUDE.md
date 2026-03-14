# lib/ — Business Logic Layer

No UI here. No React imports. Pure logic, services, and data access.

## Folder Structure
```
lib/
  natalChart/             ← modular chart engine
    index.ts              ← ONLY import from here in app code
    types.ts              ← BodyKey, AspectLine, ChartStyle, ChartForGpt, DEFAULT_STYLE
    core.ts               ← generateApproxChart, normalizeDeg (astronomy-engine)
    svg.ts                ← generateStyledChart (SVG string output)
    gpt.ts                ← generateChartForGpt (GPT-friendly JSON)
    symbols.ts            ← ZODIAC_SYMBOLS, PLANET_SYMBOLS
  __tests__/              ← Node.js test scripts (not part of app bundle)
  natalChartService.ts    ← full chart generation pipeline + DB save
  birthTimeUtils.ts       ← local time → UTC conversion using longitude
  chartImageService.ts    ← saves ViewShot PNG to file cache
  chatSessionService.ts   ← chat session helpers
  gptClient.ts            ← OpenAI streaming chat
  openai.ts               ← OpenAI client config
  svgCache.ts             ← SVG string caching
  zodiacImageLoader.ts    ← loads zodiac PNG assets as data URIs
  test-output/            ← SVG/JSON output from __tests__ scripts
```

## natalChart Module

The chart engine is split into focused files. Always import from the folder root:

```ts
import {
  generateApproxChart,   // core.ts — planetary positions, houses, aspects
  generateStyledChart,   // svg.ts  — returns SVG string
  generateChartForGpt,   // gpt.ts  — returns structured JSON for AI
  DEFAULT_STYLE,         // types.ts
  ZODIAC_SYMBOLS,        // symbols.ts
  PLANET_SYMBOLS,        // symbols.ts
} from "./natalChart"; // or "../../lib/natalChart" from screens
```

### generateApproxChart
```ts
const rawChart = generateApproxChart({ datetime: Date, lat: number, lng: number });
// Returns: { angles, houses, bodies, aspects }
```

### generateStyledChart
```ts
const svgString = generateStyledChart(rawChart, style);
// style: ChartStyle — size, colors, starry, glowEffect, zodiacImageUrls, etc.
// performanceMode: true disables gradients/filters/stars for mobile speed
```

### generateChartForGpt
```ts
const gptData = generateChartForGpt(rawChart, locationName);
// Returns structured JSON: placements, aspects, angles, emphasis (elements/modalities)
```

## natalChartService.ts

Main pipeline for the app. Use this, not the raw natalChart module:

```ts
// Full flow: read person from DB → calculate → generate SVG → save to DB
const chart = await generateAndSaveNatalChart(chartStyle, undefined, personName);
// Returns: { svgContent, chartData, style }

// Build birth data from DB records (used internally)
buildBirthDataFromPerson(person)  // Person record → BirthData
buildBirthDataFromUser(user)      // User record → BirthData
```

## Adding a New Service
1. Create `lib/myFeatureService.ts`
2. Import from DB repos (`../db/`) and lib modules (`./natalChart`, etc.)
3. Export async functions only — no React, no state
4. Keep it focused: one service = one domain
