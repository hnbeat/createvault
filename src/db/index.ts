import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "path";
import * as schema from "./schema";

// During Next.js build, use in-memory DB to avoid locking issues.
// In production with a Railway volume, use /data/sqlite.db for persistence.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const dbPath = isBuild
  ? ":memory:"
  : process.env.DATABASE_PATH || "sqlite.db";

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

const db = drizzle(sqlite, { schema });

if (isBuild) {
  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
}

export { db };
