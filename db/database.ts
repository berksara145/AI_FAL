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

      // Chat sessions table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          person_id INTEGER,
          mode TEXT DEFAULT 'interactive',
          feature TEXT,
          initial_message TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Messages table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        );
      `);

      // Create index for faster message queries
      try {
        db.execSync(`CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);`);
      } catch (e) {
        // Index might already exist, ignore
      }

      // Add columns if they don't exist (for existing databases)
      try {
        db.execSync(`ALTER TABLE chat_sessions ADD COLUMN title TEXT;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE chat_sessions ADD COLUMN person_id INTEGER;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE chat_sessions ADD COLUMN mode TEXT DEFAULT 'interactive';`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE chat_sessions ADD COLUMN feature TEXT;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE chat_sessions ADD COLUMN initial_message TEXT;`);
      } catch (e) {
        // Column already exists, ignore
      }

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
  params: (string | number | null)[] = []
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
  params: (string | number | null)[] = []
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
