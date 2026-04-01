# AI_FAL — Project Guide for Claude

## What This App Is
A React Native astrology app. Users add people (friends, partners), generate natal birth charts for them, and get AI-powered astrological insights via chat.

## Tech Stack
- **React Native + Expo** (TypeScript)
- **NativeWind** (Tailwind CSS for RN)
- **expo-sqlite** — local SQLite database (no backend)
- **React Navigation** — native-stack + bottom-tabs
- **astronomy-engine** — planetary calculations
- **OpenAI GPT** — chat and chart interpretation
- **react-native-svg + react-native-view-shot** — SVG rendering + PNG export

## Project Structure
```
AI_FAL/
├── CLAUDE.md                   ← you are here
├── App.tsx                     ← entry point, NavigationContainer
├── navigation/                 ← all navigation config
│   ├── MainTabs.tsx            ← bottom tabs + stack (Settings, History, PersonDetail)
│   ├── RootStack.tsx           ← root navigator
│   └── types.ts
├── screens/                    ← one folder per feature
│   ├── orbit/                  ← people management + birth charts
│   │   ├── components/         ← InterpretationSection, NatalChartView, TimePicker, LocationSearch
│   │   ├── hooks/              ← usePersonDetail, useOrbitNodes, useBirthMapFlow, etc.
│   │   ├── personDetailStyles.ts ← styles for PersonDetailScreen only
│   │   └── styles.ts           ← styles for OrbitScreen
│   ├── chat/                   ← chat session UI
│   │   ├── components/         ← ChatSessionCore, MessageBubble, TarotReveal, etc.
│   │   ├── hooks/              ← useChatPersons, useTarotReading, etc.
│   │   └── styles.ts           ← shared chat styles
│   ├── explore/                ← insights/horoscopes
│   │   ├── components/         ← Avatar, ContentModal, EditPanel, ListRow, FeatureCard, etc.
│   │   ├── hooks/              ← useSettings, useHistory
│   │   └── styles.ts           ← shared explore styles (exports C color tokens + styles)
│   └── onboarding/             ← first-launch user setup
├── lib/                        ← business logic, no UI
│   ├── natalChart/             ← modular chart engine (index.ts re-exports all)
│   ├── natalChartService.ts    ← chart generation + DB persistence
│   └── ...other services
├── db/                         ← SQLite repos (one file per table)
├── types/                      ← shared TypeScript types
├── utils/                      ← pure utility functions
├── components/                 ← truly shared UI components
│   ├── StarfieldBackground.tsx ← animated nebula + stars + constellations (used by Splash + MainTabs)
│   └── ...
└── assets/                     ← images, fonts
```

## Navigation Structure
```
RootStack
├── Splash
├── UserInfoChat          ← onboarding
├── MainApp
│   ├── Tabs
│   │   ├── Insights      ← ExploreScreen
│   │   └── Birth Chart   ← OrbitScreen (people ring) — tab label is "Birth Chart", route name is still "Orbit"
│   ├── Settings
│   ├── History
│   └── PersonDetail      ← individual person profile
└── ChatSession           ← full-screen modal chat (birthMap, insights, etc.)
```

## Core Rules — Always Follow

### 1. Screens don't touch the database directly
Screens call services or repos through hooks. DB imports belong in `lib/` services or `db/` repos only.
```ts
// ❌ Wrong — DB call in screen
import { getPersonByName } from "../../db/person.repo";

// ✅ Right — call through a service or hook
const { person } = usePersonDetail(name);
```

### 2. Logic goes in hooks, not in screen components
Any `useState` + `useEffect` block that isn't directly about rendering → extract to a `useXxx.ts` hook in a `hooks/` subfolder.

### 3. Natal chart imports always go through the module index
```ts
// ✅ Always import from the folder (resolves to natalChart/index.ts)
import { generateApproxChart, generateStyledChart } from "../../lib/natalChart";

// ❌ Never import from a sub-file directly in app code
import { generateApproxChart } from "../../lib/natalChart/core";
```

### 4. New screens follow this structure
```
screens/[feature]/
  [Feature]Screen.tsx       ← JSX only, imports hooks
  hooks/
    use[Feature].ts         ← state + logic
    use[SubFeature].ts      ← break up if hook >150 lines
  components/
    [Component].tsx         ← local UI components
  styles.ts                 ← StyleSheet definitions
  types.ts                  ← local types (if needed)
```

### 5. Person limit is MAX_PERSONS = 9
Always check this before creating a person.

## Common Patterns

### Loading data when screen gains focus
```ts
useFocusEffect(
  useCallback(() => {
    let mounted = true;
    loadData().then(data => { if (mounted) setData(data); });
    return () => { mounted = true; };
  }, [deps])
);
```

### Navigating to ChatSession (birth map flow)
```ts
navigation.navigate("ChatSession", {
  feature: "birthMap",
  mode: "interactive",
  personName: "Alice",
  birthDate: "12 Nov 2002",
});
```

### Generating a natal chart
```ts
import { generateAndSaveNatalChart } from "../../lib/natalChartService";
const chart = await generateAndSaveNatalChart(chartStyle, undefined, personName);
```

## Theme / Colors
All colors live in `utils/theme.ts`. Prefer using theme tokens over hardcoded hex values.
```ts
import { Colors, ChartColors } from "../../utils/theme";
// Colors.bgMain, Colors.goldPrimary, Colors.textMuted, etc.
// ChartColors for natal chart backgroundColor/primaryRing/etc.
```
The `screens/explore/styles.ts` exports its own `C` color token object — this is the canonical style source for all explore-feature screens (SettingsScreen, HistoryScreen) and their components. Import `{ styles, C }` from there instead of redefining locally.

## Shared Components
- **`components/StarfieldBackground`** — renders nebula gradients, constellations, static stars, twinkling stars, and shooting stars. Used by `SplashScreen` and `MainTabs/BottomTabs`. Pass `idPrefix` prop to avoid SVG gradient ID collisions.
  ```ts
  import StarfieldBackground from "../../components/StarfieldBackground";
  <StarfieldBackground idPrefix="sp" />
  ```

## What NOT to Do
- Don't add features not asked for
- Don't create new files unless necessary
- Don't use `any` — use proper types from `types/`
- Don't add console.log unless debugging (remove before committing)
- Don't call `generateApproxChart` directly from screens — use `natalChartService`
