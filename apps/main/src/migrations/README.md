# Database Migrations

This directory contains database migration files.

## Migration File Format

Migration files should be named with the pattern: `VERSION_NAME.sql`

Example:

- `001_initial_schema.sql`
- `002_add_users_table.sql`
- `003_add_indexes.sql`

## Migration File Structure

Each migration file should contain SQL statements to apply the migration:

```sql
-- Example: 001_initial_schema.sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## How Migrations Work

1. Migrations are automatically run when the app starts (in `main.ts`)
2. The `MigrationManager` tracks applied migrations in the `schema_migrations` table
3. Only pending migrations (not yet applied) will be executed
4. Migrations are applied in version order (sorted by version number)

## Adding a New Migration

1. Create a new `.sql` file in this directory
2. Use the next sequential version number
3. Write your SQL statements
4. The migration will be automatically applied on next app start
