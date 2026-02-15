import { executeSql, querySql } from "./database";
import { getOrCreateUser } from "./user.repo";

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
 * Get the "self" person — the one representing the current user (created in onboarding).
 * Tries by name first (case-insensitive), then by matching the user's birth date so we always find the onboarding-created record.
 */
export const getSelfPerson = async (): Promise<Person | null> => {
  const user = await getOrCreateUser();
  const name = user.name?.trim() || "You";
  const byName = await getPersonByName(name);
  if (byName) return byName;
  // Case-insensitive name match (e.g. "berj" vs "Berj" from onboarding)
  const all = await getAllPersons();
  const byNameCaseInsensitive = all.find(
    (p) => p.name != null && p.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (byNameCaseInsensitive) return byNameCaseInsensitive;
  // Fallback: person created in onboarding has same birth date as user
  if (user.birth_year != null && user.birth_month != null && user.birth_day != null) {
    const match = all.find(
      (p) =>
        p.birth_year === user.birth_year &&
        p.birth_month === user.birth_month &&
        p.birth_day === user.birth_day
    );
    return match ?? null;
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
  await executeSql(
    `INSERT INTO persons (
      owner_user_id, name, birth_year, birth_month, birth_day,
      birth_hour, birth_minute, birth_place_name, birth_place_id, birth_lat,
      birth_lng, svg_content, png_path, style, chart_gpt_json, generated_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, datetime('now'), datetime('now'))`,
    [user.id, name, birthYear, birthMonth, birthDay, birthHour, birthMinute, placeName, placeId, lat, lng]
  );
};

/**
 * Create a person with only name and birth date (for "add person" flow).
 * Time, location, and chart are filled later via birth map chat.
 */
export const createPersonMinimal = async (params: {
  name: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
}): Promise<void> => {
  const user = await getOrCreateUser();
  const { name, birth_year, birth_month, birth_day } = params;
  const existing = await querySql<Person>("SELECT id FROM persons WHERE owner_user_id = ? AND name = ? LIMIT 1", [user.id, name]);
  if (existing.length > 0) {
    await executeSql(
      "UPDATE persons SET birth_year = ?, birth_month = ?, birth_day = ?, updated_at = datetime('now') WHERE id = ?",
      [birth_year, birth_month, birth_day, existing[0].id]
    );
    return;
  }
  await executeSql(
    `INSERT INTO persons (
      owner_user_id, name, birth_year, birth_month, birth_day,
      birth_hour, birth_minute, birth_place_name, birth_place_id, birth_lat,
      birth_lng, svg_content, png_path, style, chart_gpt_json, generated_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, datetime('now'), datetime('now'))`,
    [user.id, name, birth_year, birth_month, birth_day]
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

  // Insert new person record
  await executeSql(
    `INSERT INTO persons (
      owner_user_id, name, birth_year, birth_month, birth_day,
      birth_hour, birth_minute, birth_place_name, birth_place_id, birth_lat,
      birth_lng, svg_content, png_path, style, chart_gpt_json, generated_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
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
