# db/ — Database Layer (SQLite)

Local SQLite via expo-sqlite. No backend. All data lives on the device.

## Files
```
db/
  database.ts     ← schema init, call initDatabase() on app start
  user.repo.ts    ← the single app user (onboarding data, birth info)
  person.repo.ts  ← people in the user's orbit (up to MAX_PERSONS = 9)
  chat.repo.ts    ← chat sessions and messages
```

## Table Schemas

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | singleton (always 1 user) |
| name | TEXT | |
| birth_year/month/day | INTEGER | |
| birth_hour/minute | INTEGER | nullable until set |
| birth_place_name | TEXT | |
| birth_place_id | TEXT | Google Place ID |
| birth_lat/lng | REAL | |
| onboarding_completed | INTEGER | 0 or 1 |

### persons
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| owner_user_id | INTEGER | FK → users.id |
| name | TEXT | |
| birth_year/month/day | INTEGER | |
| birth_hour/minute | INTEGER | nullable — set when chart is generated |
| birth_place_name/id | TEXT | nullable |
| birth_lat/lng | REAL | nullable |
| svg_content | TEXT | full SVG string, large |
| png_path | TEXT | path to cached PNG file |
| style | TEXT | JSON of ChartStyleConfig |
| chart_gpt_json | TEXT | JSON for AI interpretation |
| orbit_avatar_index | INTEGER | 0–7, avatar image index |
| generated_at | TEXT | ISO timestamp |

### chat_sessions
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| title | TEXT | |
| person_id | INTEGER | nullable FK → persons.id |
| mode | TEXT | "interactive" or "readonly" |
| feature | TEXT | "birthMap", "insights", etc. |
| initial_message | TEXT | |
| created_at / updated_at | TEXT | ISO timestamps |

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| session_id | INTEGER | FK → chat_sessions.id CASCADE |
| role | TEXT | "user", "assistant", "system" |
| content | TEXT | |
| timestamp | TEXT | ISO timestamp |

## Key Repo Functions

### user.repo.ts
```ts
getOrCreateUser()           // always returns the single user
updateBirthTime(h, m, name?)  // name = update person instead of user
updateBirthLocation(loc, name?)
upsertSelfPersonFromCurrentUser()  // syncs user data into persons table as "You"
```

### person.repo.ts
```ts
getAllPersons()             // all persons for current user
getPersonByName(name)       // lookup by name
getSelfPerson()             // the "You" person (linked to user)
createPersonMinimal({ name, birth_year, birth_month, birth_day })
upsertPersonWithChart(data) // save generated chart data
getNextAvatarIndex()        // returns 0–7 for avatar assignment
MAX_PERSONS = 9             // hard limit — always check before creating
```

### chat.repo.ts
```ts
createChatSession({ mode, feature, initialMessage })
getChatSession(id)
getMessagesBySession(sessionId)
addMessage({ sessionId, role, content })
```

## Rules
- Never call DB functions from screen components — use services or hooks
- Always handle the `PERSON_LIMIT_REACHED` error from `createPersonMinimal`
- `birth_hour` and `birth_minute` can be null (person added with just birth date)
- `png_path` is null until chart is generated and captured via ViewShot
