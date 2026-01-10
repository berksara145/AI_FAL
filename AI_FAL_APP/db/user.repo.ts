import { executeSql, querySql, initDatabase } from "./database";

export interface User {
  id: number;
  name: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  onboarding_completed: number; // 0 = false, 1 = true (SQLite doesn't have boolean)
  created_at: string;
  updated_at: string;
}

// Initialize database on first import
let dbInitialized = false;

const ensureDatabaseInitialized = async (): Promise<void> => {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
};

/**
 * Get or create the single user
 * Since this is a local database, there will be only one user
 * If no user exists, create one. If user exists, return it.
 * This is the main function to use everywhere - always returns a user.
 */
export const getOrCreateUser = async (): Promise<User> => {
  await ensureDatabaseInitialized();

  try {
    // First, check if a user exists
    const existingUsers = await querySql<User>("SELECT * FROM users LIMIT 1");

    if (existingUsers.length > 0) {
      // User exists, return it
      return existingUsers[0];
    } else {
      // No user exists, create one (empty user with only ID)
      const insertResult = await executeSql(
        "INSERT INTO users (created_at, updated_at) VALUES (datetime('now'), datetime('now'))"
      );

      // Fetch the newly created user
      const newUsers = await querySql<User>("SELECT * FROM users WHERE id = ?", [
        insertResult.lastInsertRowId,
      ]);

      if (newUsers.length > 0) {
        console.log("New user created:", newUsers[0]);
        return newUsers[0];
      } else {
        throw new Error("Failed to create user");
      }
    }
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
};

/**
 * Get the current user (the only user in local database)
 * Returns null if no user exists (shouldn't happen if using getOrCreateUser)
 * @deprecated Use getOrCreateUser() instead
 */
export const getCurrentUser = async (): Promise<User | null> => {
  await ensureDatabaseInitialized();

  try {
    const users = await querySql<User>("SELECT * FROM users LIMIT 1");
    if (users.length > 0) {
      return users[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Automatically login or register user
 * @deprecated Use getOrCreateUser() instead
 */
export const autoLoginOrRegister = getOrCreateUser;

/**
 * Update user's updated_at timestamp
 * Automatically gets the user from database (there's only one user)
 */
export const updateUserTimestamp = async (): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    const user = await getOrCreateUser();
    await executeSql(
      "UPDATE users SET updated_at = datetime('now') WHERE id = ?",
      [user.id]
    );
  } catch (error) {
    console.error("Error updating user timestamp:", error);
    throw error;
  }
};

/**
 * Update user's name
 * Automatically gets the user from database (there's only one user)
 */
export const updateUserName = async (name: string): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    const user = await getOrCreateUser();
    await executeSql(
      "UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?",
      [name, user.id]
    );
    console.log("User name updated successfully");
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error;
  }
};

/**
 * Mark onboarding as completed
 * Automatically gets the user from database (there's only one user)
 */
export const completeOnboarding = async (): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    const user = await getOrCreateUser();
    await executeSql(
      "UPDATE users SET onboarding_completed = 1, updated_at = datetime('now') WHERE id = ?",
      [user.id]
    );
    console.log("Onboarding marked as completed");
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
};

/**
 * Update user's birth date
 * Automatically gets the user from database (there's only one user)
 */
export const updateBirthDate = async (
  year: number,
  month: number,
  day: number
): Promise<void> => {
  await ensureDatabaseInitialized();

  try {
    const user = await getOrCreateUser();
    await executeSql(
      "UPDATE users SET birth_year = ?, birth_month = ?, birth_day = ?, updated_at = datetime('now') WHERE id = ?",
      [year, month, day, user.id]
    );
    console.log("User birth date updated successfully");
  } catch (error) {
    console.error("Error updating birth date:", error);
    throw error;
  }
};

/**
 * Check if onboarding is completed
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  await ensureDatabaseInitialized();

  try {
    const users = await querySql<{ onboarding_completed: number }>(
      "SELECT onboarding_completed FROM users LIMIT 1"
    );
    if (users.length > 0) {
      return users[0].onboarding_completed === 1;
    }
    return false;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};
