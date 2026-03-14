Add a new feature to the AI_FAL app end-to-end.

The user will provide: $ARGUMENTS (feature description, e.g. "tarot card daily reading")

Follow this process:

1. Ask clarifying questions first:
   - Where does it show up in the UI? (which tab, which screen)
   - Does it need a new screen or fit into an existing one?
   - Does it need DB storage?
   - Does it use GPT/AI?
   - Does it involve natal chart data?

2. Plan the implementation:
   - New screen(s) needed?
   - New DB columns or tables?
   - New service in lib/?
   - Navigation changes?
   - New AI prompts?

3. Implement in this order:
   a. DB schema changes (if any) — update `db/database.ts`
   b. DB repo functions (if any)
   c. Service layer in `lib/`
   d. Screen + hooks following the pattern in `screens/CLAUDE.md`
   e. Navigation registration

4. Key constraints:
   - MAX_PERSONS = 9 — can't exceed this
   - Local DB only — no backend calls except OpenAI
   - All screens must follow the screen/hooks/components pattern
   - Chat features should reuse `ChatSessionCore` from `screens/chat/components/`
   - Natal chart data is available via `getPersonByName(name).chart_gpt_json`
