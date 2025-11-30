import knex, { Knex } from "knex";
import { getDatabase } from "@negeseuon/db";

let knexInstance: Knex | null = null;

/**
 * Gets or creates the Knex instance connected to better-sqlite3
 * Note: Knex will create its own connection to the same database file
 * This ensures compatibility with Knex's connection pooling and transaction handling
 *
 * The database must be initialized before calling this function (via getDatabase().initialize())
 */
export function getKnex(): Knex {
  if (knexInstance) {
    return knexInstance;
  }

  // Get the database path from the already-initialized database manager
  // This ensures Knex connects to the same database file used by DatabaseManager
  const dbManager = getDatabase();
  const dbPath = dbManager.getPath();

  // Knex configuration for better-sqlite3
  // Knex will create its own connection to the same database file
  knexInstance = knex({
    client: "better-sqlite3",
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
    // SQLite-specific settings
    pool: {
      min: 1,
      max: 1, // SQLite doesn't benefit from multiple connections
    },
  });

  return knexInstance;
}

/**
 * Closes the Knex connection
 */
export function closeKnex(): Promise<void> {
  if (knexInstance) {
    const instance = knexInstance;
    knexInstance = null;
    return instance.destroy();
  }
  return Promise.resolve();
}
