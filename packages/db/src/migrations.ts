import type { Database } from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export interface Migration {
  version: number;
  name: string;
  up: string; // SQL to apply the migration
  down?: string; // SQL to rollback the migration (optional)
}

export class MigrationManager {
  private db: Database;
  private migrationsTable = "schema_migrations";

  constructor(db: Database) {
    this.db = db;
    this.ensureMigrationsTable();
  }

  /**
   * Creates the migrations tracking table if it doesn't exist
   */
  private ensureMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * Gets all applied migrations
   */
  public getAppliedMigrations(): number[] {
    const stmt = this.db.prepare(
      `SELECT version FROM ${this.migrationsTable} ORDER BY version`
    );
    const rows = stmt.all() as Array<{ version: number }>;
    return rows.map((row) => row.version);
  }

  /**
   * Records a migration as applied
   */
  private recordMigration(version: number, name: string): void {
    const stmt = this.db.prepare(
      `INSERT INTO ${this.migrationsTable} (version, name) VALUES (?, ?)`
    );
    stmt.run(version, name);
  }

  /**
   * Removes a migration record (for rollback)
   */
  private removeMigration(version: number): void {
    const stmt = this.db.prepare(
      `DELETE FROM ${this.migrationsTable} WHERE version = ?`
    );
    stmt.run(version);
  }

  /**
   * Applies a single migration
   */
  public applyMigration(migration: Migration): void {
    const applied = this.getAppliedMigrations();
    if (applied.includes(migration.version)) {
      console.log(
        `Migration ${migration.version}: ${migration.name} already applied`
      );
      return;
    }

    console.log(`Applying migration ${migration.version}: ${migration.name}`);
    this.db.transaction(() => {
      this.db.exec(migration.up);
      this.recordMigration(migration.version, migration.name);
    })();
    console.log(`Migration ${migration.version} applied successfully`);
  }

  /**
   * Rolls back a single migration
   */
  public rollbackMigration(migration: Migration): void {
    if (!migration.down) {
      throw new Error(
        `Migration ${migration.version}: ${migration.name} does not have a rollback script`
      );
    }

    const applied = this.getAppliedMigrations();
    if (!applied.includes(migration.version)) {
      console.log(
        `Migration ${migration.version}: ${migration.name} is not applied`
      );
      return;
    }

    console.log(
      `Rolling back migration ${migration.version}: ${migration.name}`
    );
    this.db.transaction(() => {
      if (migration.down) {
        this.db.exec(migration.down);
      }
      this.removeMigration(migration.version);
    })();
    console.log(`Migration ${migration.version} rolled back successfully`);
  }

  /**
   * Applies all pending migrations
   */
  public applyMigrations(migrations: Migration[]): void {
    // Sort migrations by version
    const sortedMigrations = [...migrations].sort(
      (a, b) => a.version - b.version
    );
    const applied = this.getAppliedMigrations();

    for (const migration of sortedMigrations) {
      if (!applied.includes(migration.version)) {
        this.applyMigration(migration);
      }
    }
  }

  /**
   * Loads migrations from a directory
   */
  public static loadMigrationsFromDirectory(
    migrationsDir: string
  ): Migration[] {
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`Migrations directory not found: ${migrationsDir}`);
      return [];
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter(
        (file) =>
          file.endsWith(".sql") || file.endsWith(".ts") || file.endsWith(".js")
      )
      .sort();

    const migrations: Migration[] = [];

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Parse migration file
      // Expected format: VERSION_NAME.sql or VERSION_NAME.ts
      const match = file.match(/^(\d+)_(.+)\.(sql|ts|js)$/);
      if (!match || !match[1] || !match[2]) {
        console.warn(`Skipping invalid migration file: ${file}`);
        continue;
      }

      const version = parseInt(match[1], 10);
      const name = match[2];

      // For SQL files, treat entire content as "up" migration
      // For TS/JS files, expect exports
      if (file.endsWith(".sql")) {
        migrations.push({
          version,
          name,
          up: content,
        });
      } else {
        // For TS/JS files, you would need to require/import them
        // This is a simplified version - you might want to enhance this
        console.warn(
          `TypeScript/JavaScript migrations not fully supported yet: ${file}`
        );
      }
    }

    return migrations;
  }
}
