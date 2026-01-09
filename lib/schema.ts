import { db } from "./db";

export async function initSchema() {
  console.log("Initializing schema...");

  await db.batch(
    [
      // users table
      `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      status TEXT,
      is_online INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
      // crews table
      `CREATE TABLE IF NOT EXISTS crews (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
      // user_crews junction table
      `CREATE TABLE IF NOT EXISTS user_crews (
      user_id TEXT NOT NULL,
      crew_id TEXT NOT NULL,
      PRIMARY KEY (user_id, crew_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (crew_id) REFERENCES crews (id) ON DELETE CASCADE
    )`,
      // friendships table
      `CREATE TABLE IF NOT EXISTS friendships (
      user_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE
    )`,
      // hangs table
      `CREATE TABLE IF NOT EXISTS hangs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      suggested_by TEXT NOT NULL,
      parent_approved INTEGER DEFAULT 0,
      status TEXT DEFAULT 'suggested',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (suggested_by) REFERENCES users (id)
    )`,
      // hang_participants junction table
      `CREATE TABLE IF NOT EXISTS hang_participants (
      hang_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (hang_id, user_id),
      FOREIGN KEY (hang_id) REFERENCES hangs (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,
      // activities table
      `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      hang_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_id) REFERENCES users (id),
      FOREIGN KEY (target_user_id) REFERENCES users (id),
      FOREIGN KEY (hang_id) REFERENCES hangs (id) ON DELETE CASCADE
    )`,
      // parents table
      `CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
      // children table (extending users model logic)
      `CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE CASCADE
    )`,
    ],
    "write"
  );

  console.log("Schema initialized successfully.");
}

// If this file is run directly, execute initSchema
if (require.main === module) {
  initSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Error initializing schema:", err);
      process.exit(1);
    });
}
