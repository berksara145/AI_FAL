Create a new screen for the AI_FAL app.

The user will provide: $ARGUMENTS (feature name, e.g. "ProfileEdit" or "orbit/ProfileEdit")

Follow this exact process:

1. Determine the folder path: `screens/[feature]/` based on the argument
2. Read `screens/CLAUDE.md` to understand the pattern
3. Create these files:
   - `screens/[feature]/[Feature]Screen.tsx` — screen component (thin, JSX only)
   - `screens/[feature]/hooks/use[Feature].ts` — main logic hook
   - `screens/[feature]/styles.ts` — StyleSheet.create({})

4. Screen component template:
```tsx
import React from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import { use[Feature] } from "./hooks/use[Feature]";

export default function [Feature]Screen() {
  const navigation = useNavigation();
  const { /* destructure from hook */ } = use[Feature]();

  return (
    <View style={styles.container}>
      <Text>TODO</Text>
    </View>
  );
}
```

5. Hook template:
```ts
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

export function use[Feature]() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      // load data
      return () => { mounted = false; };
    }, [])
  );

  return { data, isLoading };
}
```

6. Register the screen in navigation if asked (check `navigation/RootStack.tsx` or `navigation/MainTabs.tsx`)

7. Ask the user what data/functionality the screen needs before writing full implementation.
