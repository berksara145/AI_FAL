# screens/ — UI Layer

Each feature gets its own folder. Screens are thin — logic lives in hooks.

## Structure Pattern
Every feature folder should look like this:
```
screens/[feature]/
  [Feature]Screen.tsx     ← JSX only, ~50-150 lines
  hooks/
    use[Feature].ts       ← main state + logic hook
    use[SubThing].ts      ← split if hook grows >150 lines
  components/
    [Component].tsx       ← local UI pieces used only here
  styles.ts               ← all StyleSheet.create() calls
  types.ts                ← local types (optional)
  utils.ts                ← pure helpers (optional)
```

## Current Screens

### orbit/ — People management
- `OrbitScreen.tsx` — visual ring of people, loads from DB on focus
- `PersonDetailScreen.tsx` — zodiac symbol, birth date pills, cached chart PNG, "Open Birth Map" CTA
- `BirthMapChatWrapper.tsx` — chat flow for adding people + generating natal charts (178 lines, coordinates 4 hooks)
- `OrbitNode.tsx` — single node component in the orbit ring
- `styles.ts`, `constants.ts`, `utils.ts`
- `hooks/` — useOrbitNodes, useChatSession, useAddPersonFlow, useBirthMapFlow, useChartCapture
- `components/` — TimePicker, LocationSearch

### chat/ — Chat session UI
- `ChatSessionScreen.tsx` — renders chat for any feature (birthMap, insights, etc.)
- `components/ChatSessionCore.tsx` — reusable chat UI (messages + input)

### explore/ — Insights tab
- `ExploreScreen.tsx` — horoscopes/insights landing
- `HistoryScreen.tsx` — past chat sessions
- `SettingsScreen.tsx` — user settings

### onboarding/ — First launch
- `UserInfoChatScreen.tsx` — collects name + birth data via chat
- `components/BirthDatePicker.tsx` — wheel date picker
- `hooks/useOnboarding.ts` — consolidated: name step, date picker, AI message logic

## Navigation from Screens

### Navigate to chat session (birth map)
```ts
const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
rootNav?.navigate("ChatSession", {
  feature: "birthMap",
  mode: "interactive",
  personName: "Alice",
  birthDate: "12 Nov 2002",
});
```

### Navigate to PersonDetail
```ts
navigation.navigate("PersonDetail", {
  name: person.name,
  zodiac: "Scorpio",
  zodiacSymbol: "♏",
  birthDate: "12 Nov 2002",
});
```

### Go back
```ts
navigation.goBack();
```

## Rules
- Use `useFocusEffect` (not `useEffect`) for data loading — re-runs when screen gains focus
- Always set `mounted = true/false` guard in focus effects to prevent state updates after unmount
- Screen components should have zero direct DB imports
- Styles go in `styles.ts`, not inline in JSX (except dynamic values)
- Navigation types: import from `../../navigation/RootStack` or `../../navigation/MainTabs`
