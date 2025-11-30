import path from "node:path";
import fs from "node:fs";
import { getDatabase, MigrationManager } from "@negeseuon/db";

/**
 * Runs all pending migrations
 * This should be called during app initialization
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log("Starting database migrations...");

    // Initialize database
    const dbManager = getDatabase({
      filename: "negeseuon.db",
      verbose: process.env.NODE_ENV === "development",
    });
    const db = dbManager.initialize();

    // Load migrations from the migrations directory
    // In development, migrations are in src/migrations
    // In production, they're in the built output
    const migrationsDir = path.join(__dirname, "../migrations");

    // Try multiple possible paths
    const possiblePaths = [
      migrationsDir, // Built output location
      path.join(__dirname, "../../src/migrations"), // Source location (dev)
      path.resolve(process.cwd(), "apps/main/src/migrations"), // Workspace root relative
    ];

    let migrations: ReturnType<
      typeof MigrationManager.loadMigrationsFromDirectory
    > = [];
    let foundPath: string | null = null;

    for (const migrationsPath of possiblePaths) {
      if (fs.existsSync(migrationsPath)) {
        migrations =
          MigrationManager.loadMigrationsFromDirectory(migrationsPath);
        if (migrations.length > 0) {
          foundPath = migrationsPath;
          break;
        }
      }
    }

    if (!foundPath) {
      console.warn(
        "No migrations directory found. Database will be initialized without migrations."
      );
      // Still create the migration manager to ensure the schema_migrations table exists
      new MigrationManager(db);
      return;
    }

    console.log(`Loading migrations from: ${foundPath}`);
    console.log(`Found ${migrations.length} migration(s)`);

    // Apply migrations
    const migrationManager = new MigrationManager(db);
    migrationManager.applyMigrations(migrations);

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}
