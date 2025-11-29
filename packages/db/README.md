# @negeseuon/db

Database management package for Negeseuon Electron application using SQLite3.

## Features

- ✅ SQLite3 database management with `better-sqlite3`
- ✅ Automatic path resolution using Electron's userData directory
- ✅ Migration system for schema management
- ✅ Transaction support
- ✅ TypeScript support
- ✅ Utility functions for common database operations

## Installation

This package is part of the workspace and can be used in other packages:

```json
{
  "dependencies": {
    "@negeseuon/db": "workspace:*"
  }
}
```

## Usage

### Basic Setup

```typescript
import { DatabaseManager, getDatabase } from "@negeseuon/db";

// Option 1: Create a new instance
const dbManager = new DatabaseManager({
  filename: "myapp.db",
  verbose: true, // Enable logging
});

// Initialize the database
const db = dbManager.initialize();

// Option 2: Use the singleton instance
const dbManager = getDatabase({ filename: "myapp.db" });
const db = dbManager.initialize();
```

### Executing Queries

```typescript
import { DatabaseUtils } from "@negeseuon/db";

const db = dbManager.getDatabase();

// Query all rows
const users = DatabaseUtils.query(db, "SELECT * FROM users WHERE age > ?", [
  18,
]);

// Query a single row
const user = DatabaseUtils.queryOne(db, "SELECT * FROM users WHERE id = ?", [
  1,
]);

// Execute insert/update/delete
const result = DatabaseUtils.execute(
  db,
  "INSERT INTO users (name, email) VALUES (?, ?)",
  ["John Doe", "john@example.com"]
);
console.log(`Inserted ID: ${result.lastInsertRowid}`);
```

### Using Transactions

```typescript
const db = dbManager.getDatabase();

dbManager.transaction((db) => {
  const insertUser = db.prepare("INSERT INTO users (name) VALUES (?)");
  const insertPost = db.prepare(
    "INSERT INTO posts (user_id, title) VALUES (?, ?)"
  );

  const userResult = insertUser.run("John Doe");
  const userId = Number(userResult.lastInsertRowid);
  insertPost.run(userId, "My First Post");
});
```

### Migrations

Create migration files in a `migrations` directory:

```
migrations/
  001_initial_schema.sql
  002_add_users_table.sql
  003_add_posts_table.sql
```

Migration file format (`001_initial_schema.sql`):

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Apply migrations:

```typescript
import { DatabaseManager, MigrationManager } from "@negeseuon/db";
import path from "node:path";

const dbManager = new DatabaseManager({ filename: "myapp.db" });
const db = dbManager.initialize();

// Load and apply migrations
const migrationsDir = path.join(__dirname, "migrations");
const migrations = MigrationManager.loadMigrationsFromDirectory(migrationsDir);

const migrationManager = new MigrationManager(db);
migrationManager.applyMigrations(migrations);
```

### Programmatic Migrations

You can also define migrations programmatically:

```typescript
import { MigrationManager, type Migration } from "@negeseuon/db";

const migrations: Migration[] = [
  {
    version: 1,
    name: "initial_schema",
    up: `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `,
    down: `DROP TABLE users;`,
  },
  {
    version: 2,
    name: "add_email",
    up: `ALTER TABLE users ADD COLUMN email TEXT;`,
    down: `ALTER TABLE users DROP COLUMN email;`,
  },
];

const migrationManager = new MigrationManager(db);
migrationManager.applyMigrations(migrations);
```

### Closing the Database

```typescript
// Close when done (e.g., on app quit)
dbManager.close();
```

## API Reference

### DatabaseManager

Main class for managing database connections.

#### Methods

- `initialize()`: Initializes the database connection
- `getDatabase()`: Gets the database instance (throws if not initialized)
- `close()`: Closes the database connection
- `getPath()`: Returns the database file path
- `transaction<T>(fn)`: Executes a transaction
- `prepare(sql)`: Prepares a SQL statement
- `exec(sql)`: Executes raw SQL

### MigrationManager

Manages database schema migrations.

#### Methods

- `applyMigration(migration)`: Applies a single migration
- `rollbackMigration(migration)`: Rolls back a single migration
- `applyMigrations(migrations)`: Applies all pending migrations
- `getAppliedMigrations()`: Returns list of applied migration versions
- `loadMigrationsFromDirectory(dir)`: Static method to load migrations from a directory

### DatabaseUtils

Utility functions for common database operations.

#### Methods

- `query<T>(db, sql, options)`: Execute a query and return all rows
- `queryOne<T>(db, sql, params)`: Execute a query and return a single row
- `execute(db, sql, params)`: Execute an insert/update/delete
- `tableExists(db, tableName)`: Check if a table exists
- `getTables(db)`: Get all table names

## Best Practices

1. **Initialize once**: Initialize the database when your app starts, typically in the Electron main process
2. **Close on exit**: Close the database connection when your app quits
3. **Use transactions**: Use transactions for operations that need to be atomic
4. **Prepare statements**: For repeated queries, use prepared statements for better performance
5. **Migration naming**: Use descriptive names for migrations (e.g., `001_initial_schema.sql`)

## Example: Integration in Electron App

```typescript
// main.ts
import { app } from "electron";
import { getDatabase, MigrationManager } from "@negeseuon/db";
import path from "node:path";

let dbManager: ReturnType<typeof getDatabase>;

app.on("ready", () => {
  // Initialize database
  dbManager = getDatabase({ filename: "app.db" });
  const db = dbManager.initialize();

  // Apply migrations
  const migrationsDir = path.join(__dirname, "migrations");
  const migrations =
    MigrationManager.loadMigrationsFromDirectory(migrationsDir);
  const migrationManager = new MigrationManager(db);
  migrationManager.applyMigrations(migrations);

  // Create window, etc.
});

app.on("before-quit", () => {
  // Close database on app quit
  dbManager?.close();
});
```
