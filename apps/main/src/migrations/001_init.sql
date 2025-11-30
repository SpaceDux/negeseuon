CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_connections_type ON connections(type);

CREATE TABLE IF NOT EXISTS tabs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type varchar(32) NOT NULL,
    context jsonb NOT NULL,
    closed_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tabs_type ON tabs(type);
CREATE INDEX IF NOT EXISTS idx_tabs_closed_at ON tabs(closed_at);
CREATE INDEX IF NOT EXISTS idx_tabs_created_at ON tabs(created_at);
CREATE INDEX IF NOT EXISTS idx_tabs_updated_at ON tabs(updated_at);