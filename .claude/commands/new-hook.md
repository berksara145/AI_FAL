Create a new custom hook for the AI_FAL app.

The user will provide: $ARGUMENTS (hook name and which screen/feature it belongs to, e.g. "useChartCapture for orbit/BirthMapChatWrapper")

Follow this process:

1. Determine where it lives:
   - If it's for a specific screen → `screens/[feature]/hooks/use[Name].ts`
   - If it's shared across screens → `screens/hooks/use[Name].ts` (create if needed)
   - If it's pure logic with no UI → `lib/hooks/use[Name].ts`

2. Read the relevant CLAUDE.md for that folder to understand conventions.

3. Hook template:
```ts
import { useState, useCallback, useRef } from "react";

export function use[Name]() {
  // state

  // handlers / effects

  return {
    // expose only what the screen needs
  };
}
```

4. Rules to follow:
   - No direct DB imports — call services from `lib/`
   - No navigation imports (pass navigation as a param or callback instead)
   - Return a flat object, not nested
   - Keep it under 150 lines — if it grows bigger, split further

5. After creating the hook, show how to use it in the target screen.
