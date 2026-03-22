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
  const rows = await querySql<TarotReading>(
    "SELECT * FROM tarot_readings WHERE date = ? ORDER BY id DESC LIMIT 1",
    [todayStr()]
  );
  return rows[0] ?? null;
}

export async function getReadingByDate(dateStr: string): Promise<TarotReading | null> {
  const rows = await querySql<TarotReading>(
    "SELECT * FROM tarot_readings WHERE date = ? ORDER BY id DESC LIMIT 1",
    [dateStr]
  );
  return rows[0] ?? null;
}

export async function getReadingBySessionId(sessionId: number): Promise<TarotReading | null> {
  const rows = await querySql<TarotReading>(
    "SELECT * FROM tarot_readings WHERE session_id = ? LIMIT 1",
    [sessionId]
  );
  return rows[0] ?? null;
}

export async function saveTarotReading(
  cardPast: string,
  cardToday: string,
  cardFuture: string,
  sessionId?: number
): Promise<number> {
  const result = await executeSql(
    "INSERT INTO tarot_readings (date, card_past, card_today, card_future, session_id) VALUES (?, ?, ?, ?, ?)",
    [todayStr(), cardPast, cardToday, cardFuture, sessionId ?? null]
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
