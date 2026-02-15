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
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_place_name TEXT;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_place_id TEXT;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_lat REAL;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_lng REAL;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_hour INTEGER;`);
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        db.execSync(`ALTER TABLE users ADD COLUMN birth_minute INTEGER;`);
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

      // Persons table - stores people associated with the local user and their natal chart info
      db.execSync(`
        CREATE TABLE IF NOT EXISTS persons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_user_id INTEGER,
          name TEXT,
          birth_year INTEGER,
          birth_month INTEGER,
          birth_day INTEGER,
          birth_hour INTEGER,
          birth_minute INTEGER,
          birth_place_name TEXT,
          birth_place_id TEXT,
          birth_lat REAL,
          birth_lng REAL,
          svg_content TEXT,
          png_path TEXT,
          style TEXT,
          generated_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Index for faster queries by owner
      try {
        db.execSync(`CREATE INDEX IF NOT EXISTS idx_persons_owner ON persons(owner_user_id);`);
      } catch (e) {
        // ignore
      }

      // Add png_path column to persons if missing (for existing DBs)
      try {
        db.execSync(`ALTER TABLE persons ADD COLUMN png_path TEXT;`);
      } catch (e) {
        // Column already exists, ignore
      }

      // Seed mock persons from orbit nodes if table empty
      try {
        // Importing nodes data (mock) to seed initial persons for the app
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodesData = require("../screens/orbit/nodesData").orbitNodes;
        // Ensure we have a user
        const users: any = db.getAllSync("SELECT id FROM users LIMIT 1", []);
        const ownerId = users && users.length > 0 ? users[0].id : null;
        if (ownerId) {
          // Wipe existing persons for this owner and re-seed from nodesData
          try {
            db.runSync("DELETE FROM persons WHERE owner_user_id = ?", [ownerId]);
          } catch (delErr) {
            console.warn("Failed to clear existing persons for owner:", delErr);
          }

          for (const node of nodesData) {
            // Prefer explicit numeric fields if provided, otherwise parse birthDate string
            const year = (node as any).birthYear ?? null;
            const month = (node as any).birthMonth ?? null;
            const day = (node as any).birthDay ?? null;

            let y = year;
            let m = month;
            let d = day;

            if (y === null || m === null || d === null) {
              const parsed = new Date(node.birthDate);
              if (!Number.isNaN(parsed.getTime())) {
                y = y ?? parsed.getFullYear();
                m = m ?? parsed.getMonth() + 1;
                d = d ?? parsed.getDate();
              }
            }

            db.runSync(
              `INSERT INTO persons (owner_user_id, name, birth_year, birth_month, birth_day, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
              [ownerId, node.label, y, m, d]
            );
          }
          console.log("Wiped and re-seeded persons table from nodesData");
        }
      } catch (e) {
        // Non-fatal: seeding failed (maybe file not present in some environments)
        console.warn("Persons seeding skipped or failed:", e);
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
