import * as SQLite from "expo-sqlite";

// Open or create the database using the synchronous API
export const db = SQLite.openDatabaseSync("ai_fal.db");

// Initialize database and create tables
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Users table - only one user for local database
      db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          birth_year INTEGER,
          birth_month INTEGER,
          birth_day INTEGER,
          onboarding_completed INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Add columns if they don't exist (for existing databases)
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN name TEXT;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_year INTEGER;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_month INTEGER;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_day INTEGER;`);
      } catch (e) {
        // Column already exists, ignore
      }

      // You can add more tables here as needed
      // For example: persons, chats, messages, etc.

      console.log("Database initialized successfully");
      resolve();
    } catch (error) {
      console.error("Database initialization error:", error);
      reject(error);
    }
  });
};

// Helper function to execute SQL queries
export const executeSql = (
  sql: string,
  params: (string | number)[] = []
): Promise<SQLite.SQLiteRunResult> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync(sql, params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to execute SQL queries and get results
export const querySql = <T = any>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.getAllSync<T>(sql, params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
