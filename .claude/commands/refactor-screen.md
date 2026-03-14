Refactor a screen in AI_FAL by extracting hooks from it.

The user will provide: $ARGUMENTS (screen file path, e.g. "screens/orbit/BirthMapChatWrapper.tsx")

Follow this process:

1. Read the target screen file fully
2. Read `screens/CLAUDE.md` for the pattern to follow
3. Identify all logical groups of state + behavior:
   - Look for clusters of useState + useEffect + handler functions that belong together
   - Each cluster = one hook

4. For each hook to extract:
   - Name it `useXxx` based on what it owns
   - Create it at `screens/[feature]/hooks/useXxx.ts`
   - Move all related state, effects, and handlers into it
   - Return only what the screen needs

5. Rewrite the screen to use the hooks — it should end up being mostly JSX.

6. Rules:
   - Don't change any logic, only reorganize it
   - Don't break existing functionality
   - Don't add new features
   - Keep the same props interface on the screen component
   - The final screen should be under 150 lines

7. After the refactor, list what each hook owns so the user understands the new structure.

Common hooks to look for in this project:
- `useChatSession` — session init, message loading, addMessage
- `useBirthMapFlow` — time picker, location picker, chart generation
- `useAddPersonFlow` — name collection, birth date picker, createPerson
- `useChartCapture` — ViewShot ref, PNG capture, saving
