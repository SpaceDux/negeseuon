import Database from "better-sqlite3";

/**
 * Helper type for database row results
 */
export type Row = Record<string, unknown>;

/**
 * Helper type for database query results
 */
export type QueryResult<T = Row> = T[];

/**
 * Options for query execution
 */
export interface QueryOptions {
  /** Parameters to bind to the query */
  params?: unknown[];
  /** Whether to return all rows or just the first */
  all?: boolean;
}

/**
 * Utility functions for common database operations
 */
export class DatabaseUtils {
  /**
   * Safely executes a query and returns results
   */
  static query<T = Row>(
    db: Database.Database,
    sql: string,
    options: QueryOptions = {}
  ): QueryResult<T> {
    const stmt = db.prepare(sql);
    const { params = [], all = true } = options;

    if (all) {
      return (stmt.all(...params) as T[]) || [];
    } else {
      const result = stmt.get(...params);
      return result ? [result as T] : [];
    }
  }

  /**
   * Executes a query and returns a single row
   */
  static queryOne<T = Row>(
    db: Database.Database,
    sql: string,
    params: unknown[] = []
  ): T | null {
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    return (result as T) || null;
  }

  /**
   * Executes an insert/update/delete and returns the last insert ID
   */
  static execute(
    db: Database.Database,
    sql: string,
    params: unknown[] = []
  ): { lastInsertRowid: number; changes: number } {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return {
      lastInsertRowid: Number(result.lastInsertRowid),
      changes: result.changes,
    };
  }

  /**
   * Checks if a table exists
   */
  static tableExists(db: Database.Database, tableName: string): boolean {
    const result = DatabaseUtils.queryOne<{ count: number }>(
      db,
      `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );
    return result?.count === 1;
  }

  /**
   * Gets all table names in the database
   */
  static getTables(db: Database.Database): string[] {
    const results = DatabaseUtils.query<{ name: string }>(
      db,
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    return results.map((row) => row.name);
  }
}
