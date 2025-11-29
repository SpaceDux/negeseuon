// Main database manager
export {
  DatabaseManager,
  getDatabase,
  resetDatabase,
  type DatabaseConfig,
} from "./database";

// Migration system
export { MigrationManager, type Migration } from "./migrations";

// Utilities and types
export {
  DatabaseUtils,
  type Row,
  type QueryResult,
  type QueryOptions,
} from "./types";

// Re-export better-sqlite3 types for convenience
export type { Database, Statement, RunResult } from "better-sqlite3";
