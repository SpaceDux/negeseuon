import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

export interface DatabaseConfig {
  /** Path to the database file. If not provided, uses Electron's userData directory */
  dbPath?: string;
  /** Database filename (default: 'database.db') */
  filename?: string;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Additional options to pass to better-sqlite3 */
  options?: Database.Options;
}

export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;
  private verbose: boolean;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig = {}) {
    this.config = config;
    this.verbose = config.verbose ?? false;
    this.dbPath = this.resolveDatabasePath(config);
  }

  /**
   * Resolves the database path, using Electron's userData directory if available
   */
  private resolveDatabasePath(config: DatabaseConfig): string {
    if (config.dbPath) {
      return config.dbPath;
    }

    // Try to use Electron's app.getPath('userData') if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { app } = require("electron");
      const userDataPath = app.getPath("userData");
      const filename = config.filename || "database.db";
      return path.join(userDataPath, filename);
    } catch {
      // Fallback to current directory if Electron is not available (e.g., during testing)
      const filename = config.filename || "database.db";
      return path.join(process.cwd(), filename);
    }
  }

  /**
   * Initializes the database connection
   */
  public initialize(): Database.Database {
    if (this.db) {
      if (this.verbose) {
        console.log("Database already initialized");
      }
      return this.db;
    }

    // Ensure the directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (this.verbose) {
      console.log(`Initializing database at: ${this.dbPath}`);
    }

    const options: Database.Options = {
      verbose: this.verbose ? console.log : undefined,
      ...(this.config.options || {}),
    };

    this.db = new Database(this.dbPath, options);

    // Enable foreign keys
    this.db.pragma("foreign_keys = ON");

    // Enable WAL mode for better concurrency
    this.db.pragma("journal_mode = WAL");

    if (this.verbose) {
      console.log("Database initialized successfully");
    }

    return this.db;
  }

  /**
   * Gets the database instance. Throws if not initialized.
   */
  public getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  /**
   * Closes the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      if (this.verbose) {
        console.log("Database connection closed");
      }
    }
  }

  /**
   * Gets the database path
   */
  public getPath(): string {
    return this.dbPath;
  }

  /**
   * Executes a transaction
   */
  public transaction<T>(fn: (db: Database.Database) => T): T {
    const db = this.getDatabase();
    const transaction = db.transaction(fn);
    return transaction(db);
  }

  /**
   * Prepares a statement for reuse
   */
  public prepare(sql: string): Database.Statement {
    return this.getDatabase().prepare(sql);
  }

  /**
   * Executes a raw SQL query
   */
  public exec(sql: string): void {
    this.getDatabase().exec(sql);
  }
}

// Export a singleton instance (optional - can also create new instances)
let defaultDatabase: DatabaseManager | null = null;

/**
 * Gets or creates the default database instance
 */
export function getDatabase(config?: DatabaseConfig): DatabaseManager {
  if (!defaultDatabase) {
    defaultDatabase = new DatabaseManager(config);
  }
  return defaultDatabase;
}

/**
 * Resets the default database instance (useful for testing)
 */
export function resetDatabase(): void {
  if (defaultDatabase) {
    defaultDatabase.close();
    defaultDatabase = null;
  }
}
