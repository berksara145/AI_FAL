import { executeSql, querySql } from "./database";
import { getOrCreateUser } from "./user.repo";

export const MAX_PERSONS = 9;

export type Person = {
  id: number;
  owner_user_id: number;
  name: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_hour: number | null;
  birth_minute: number | null;
  birth_place_name: string | null;
  birth_place_id: string | null;
  birth_lat: number | null;
  birth_lng: number | null;
  svg_content: string | null;
  png_path: string | null;
  style: string | null;
  chart_gpt_json: string | null;
  generated_at: string | null;
  orbit_avatar_index: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get all persons for the current user
 */
export const getAllPersons = async (): Promise<Person[]> => {
  const user = await getOrCreateUser();
  return await querySql<Person>("SELECT * FROM persons WHERE owner_user_id = ? ORDER BY created_at DESC", [user.id]);
};

/**
 * Get total person count for the current user (for 8-person limit).
 */
export const getPersonCount = async (): Promise<number> => {
  const user = await getOrCreateUser();
  const rows = await querySql<{ count: number }>(
    "SELECT COUNT(*) as count FROM persons WHERE owner_user_id = ?",
    [user.id]
  );
  return rows[0]?.count ?? 0;
};

/**
 * Get next available orbit avatar index (0–7) for a new person.
 * Picks the first index not yet used by any person.
 */
export const getNextAvatarIndex = async (): Promise<number> => {
  const user = await getOrCreateUser();
  const rows = await querySql<{ orbit_avatar_index: number | null }>(
    "SELECT orbit_avatar_index FROM persons WHERE owner_user_id = ?",
    [user.id]
  );
  const used = new Set(
    rows
      .map((r) => r.orbit_avatar_index)
      .filter((n): n is number => n != null)
      .map((n) => n % MAX_PERSONS)
  );
  for (let i = 0; i < MAX_PERSONS; i++) {
    if (!used.has(i)) return i;
  }
  return 0;
};

/**
 * Get persons that have natal chart data (chart_gpt_json) for the current user.
 * Used by Natal Chart Analysis to list available charts and inject data into chat.
 */
export const getPersonsWithChartData = async (): Promise<Person[]> => {
  const user = await getOrCreateUser();
  return await querySql<Person>(
    "SELECT * FROM persons WHERE owner_user_id = ? AND chart_gpt_json IS NOT NULL AND chart_gpt_json != '' ORDER BY name ASC",
    [user.id]
  );
};

/**
 * Get person by name (for current user)
 */
export const getPersonByName = async (name: string): Promise<Person | null> => {
  const user = await getOrCreateUser();
  const rows = await querySql<Person>("SELECT * FROM persons WHERE owner_user_id = ? AND name = ? LIMIT 1", [user.id, name]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Check if a person with this name already exists for the current user (case-insensitive).
 * Use before creating a new person to enforce unique names.
 */
export const isPersonNameTaken = async (name: string): Promise<boolean> => {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const all = await getAllPersons();
  return all.some(
    (p) => p.name != null && p.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
};

/**
 * Get the "self" person — the one representing the current user (created in onboarding).
 * Tries by name first (case-insensitive), then by matching the user's birth date so we always find the onboarding-created record.
 */
export const getSelfPerson = async (): Promise<Person | null> => {
  const user = await getOrCreateUser();
  const name = user.name?.trim() || "You";
  const byName = await getPersonByName(name);
  if (byName) {
    console.log('getSelfPerson return name1:', byName.name);
    return byName;
  }
  // Case-insensitive name match (e.g. "berj" vs "Berj" from onboarding)
  const all = await getAllPersons();
  const byNameCaseInsensitive = all.find(
    (p) => p.name != null && p.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (byNameCaseInsensitive) {
    console.log('getSelfPerson return name2:', byNameCaseInsensitive.name);
    return byNameCaseInsensitive;
  }
 
  return null;
};

/**
 * Create or update the "self" person from the current user's data.
 * Call this when onboarding completes so the user appears in the persons table and "YOU" is clickable in Orbit.
 */
export const upsertSelfPersonFromCurrentUser = async (): Promise<void> => {
  const user = await getOrCreateUser();
  const name = user.name?.trim() || "You";
  const birthYear = user.birth_year ?? new Date().getFullYear();
  const birthMonth = user.birth_month ?? 1;
  const birthDay = user.birth_day ?? 1;
  const birthHour = user.birth_hour ?? 12;
  const birthMinute = user.birth_minute ?? 0;
  const placeName = user.birth_place_name ?? "";
  const placeId = user.birth_place_id ?? null;
  const lat = user.birth_lat ?? 0;
  const lng = user.birth_lng ?? 0;

  const existing = await querySql<Person>("SELECT id FROM persons WHERE owner_user_id = ? AND name = ? LIMIT 1", [user.id, name]);
  if (existing.length > 0) {
    await executeSql(
      `UPDATE persons SET
        birth_year = ?, birth_month = ?, birth_day = ?,
        birth_hour = ?, birth_minute = ?,
        birth_place_name = ?, birth_place_id = ?, birth_lat = ?, birth_lng = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
      [birthYear, birthMonth, birthDay, birthHour, birthMinute, placeName, placeId, lat, lng, existing[0].id]
    );
    return;
  }
  const avatarIndex = await getNextAvatarIndex();
  await executeSql(
    `INSERT INTO persons (
      owner_user_id, name, birth_year, birth_month, birth_day,
      birth_hour, birth_minute, birth_place_name, birth_place_id, birth_lat,
      birth_lng, svg_content, png_path, style, chart_gpt_json, generated_at, orbit_avatar_index, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?, datetime('now'), datetime('now'))`,
    [user.id, name, birthYear, birthMonth, birthDay, birthHour, birthMinute, placeName, placeId, lat, lng, avatarIndex]
  );
};

/**
 * Create a person with only name and birth date (for "add person" flow).
 * Time, location, and chart are filled later via birth map chat.
 * Requires a unique name; use isPersonNameTaken() first and re-ask if true.
 * Throws PERSON_LIMIT_REACHED when user already has MAX_PERSONS (8).
 */
export const createPersonMinimal = async (params: {
  name: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
}): Promise<void> => {
  const user = await getOrCreateUser();
  const { name, birth_year, birth_month, birth_day } = params;
  const count = await getPersonCount();
  if (count >= MAX_PERSONS) {
    throw new Error("PERSON_LIMIT_REACHED");
  }
  const taken = await isPersonNameTaken(name);
  if (taken) {
    throw new Error("PERSON_NAME_EXISTS");
  }
  const avatarIndex = await getNextAvatarIndex();
  await executeSql(
    `INSERT INTO persons (
      owner_user_id, name, birth_year, birth_month, birth_day,
      birth_hour, birth_minute, birth_place_name, birth_place_id, birth_lat,
      birth_lng, svg_content, png_path, style, chart_gpt_json, generated_at, orbit_avatar_index, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, datetime('now'), datetime('now'))`,
    [user.id, name, birth_year, birth_month, birth_day, avatarIndex]
  );
};

/**
 * Upsert person record for the current user. If a person with same name exists, update; otherwise insert.
 */
export const upsertPersonWithChart = async (person: {
  name: string | null;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  birth_minute: number;
  birth_place_name: string;
  birth_place_id?: string | null;
  birth_lat: number;
  birth_lng: number;
  svg_content?: string | null;
  png_path?: string | null;
  style: string | null;
  chart_gpt_json?: string | null;
  generated_at: string;
}): Promise<void> => {
  const user = await getOrCreateUser();
  // Check existing by name (if name null, treat as anonymous and insert new)
  if (person.name) {
    const existing = await querySql<Person>("SELECT * FROM persons WHERE owner_user_id = ? AND name = ? LIMIT 1", [user.id, person.name]);
    if (existing.length > 0) {
      await executeSql(
        `UPDATE persons SET
          birth_year = ?, birth_month = ?, birth_day = ?,
          birth_hour = ?, birth_minute = ?,
          birth_place_name = ?, birth_place_id = ?, birth_lat = ?, birth_lng = ?,
          svg_content = ?, png_path = ?, style = ?, chart_gpt_json = ?, generated_at = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [
          person.birth_year,
          person.birth_month,
          person.birth_day,
          person.birth_hour,
          person.birth_minute,
          person.birth_place_name,
          person.birth_place_id || null,
          person.birth_lat,
          person.birth_lng,
          person.svg_content || null,
          person.png_path || null,
          person.style,
          person.chart_gpt_json ?? null,
          person.generated_at,
          existing[0].id,
        ]
      );
      return;
    }
  }

  // Insert new person record (assign next avatar index; limit not enforced here—caller should check)
  const avatarIndex = await getNextAvatarIndex();
  await executeSql(
    `INSERT INTO persons (
      owner_user_id, name, birth_year, birth_month, birth_day,
      birth_hour, birth_minute, birth_place_name, birth_place_id, birth_lat,
      birth_lng, svg_content, png_path, style, chart_gpt_json, generated_at, orbit_avatar_index, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [
      user.id,
      person.name || null,
      person.birth_year,
      person.birth_month,
      person.birth_day,
      person.birth_hour,
      person.birth_minute,
      person.birth_place_name,
      person.birth_place_id || null,
      person.birth_lat,
      person.birth_lng,
      person.svg_content || null,
      person.png_path || null,
      person.style,
      person.chart_gpt_json ?? null,
      person.generated_at,
      avatarIndex,
    ]
  );
};

/**
 * Update only the png_path for a person (by name, current user).
 */
export const updatePersonPngPath = async (personName: string, pngPath: string): Promise<void> => {
  const user = await getOrCreateUser();
  await executeSql(
    `UPDATE persons SET png_path = ?, updated_at = datetime('now') WHERE owner_user_id = ? AND name = ?`,
    [pngPath, user.id, personName]
  );
};
