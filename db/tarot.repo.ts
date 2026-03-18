import { executeSql, querySql } from "./database";

export interface TarotReading {
  id: number;
  date: string;
  card_past: string;
  card_today: string;
  card_future: string;
  interpretation: string | null;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function getTodayReading(): Promise<TarotReading | null> {
  // DEBUG: always return null so a fresh draw is shown on every restart
  return null;
  const rows = await querySql<TarotReading>(
    "SELECT * FROM tarot_readings WHERE date = ? LIMIT 1",
    [todayStr()]
  );
  return rows[0] ?? null;
}

export async function saveTarotReading(
  cardPast: string,
  cardToday: string,
  cardFuture: string
): Promise<number> {
  const result = await executeSql(
    "INSERT INTO tarot_readings (date, card_past, card_today, card_future) VALUES (?, ?, ?, ?)",
    [todayStr(), cardPast, cardToday, cardFuture]
  );
  return result.lastInsertRowId;
}

export async function updateTarotInterpretation(
  id: number,
  interpretation: string
): Promise<void> {
  await executeSql(
    "UPDATE tarot_readings SET interpretation = ? WHERE id = ?",
    [interpretation, id]
  );
}
