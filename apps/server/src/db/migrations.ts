import Database from 'better-sqlite3'

type DB = InstanceType<typeof Database>

export interface Migration {
  id: number
  name: string
  sql: string
}

export const migrations: Migration[] = [
  {
    id: 1,
    name: 'init',
    sql: `
      CREATE TABLE accounts (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        name TEXT NOT NULL,
        credential TEXT,
        status TEXT NOT NULL DEFAULT 'unknown',
        isEnabled INTEGER NOT NULL DEFAULT 1,
        lastHealthCheckAt TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL REFERENCES accounts(id),
        platform TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        cost REAL NOT NULL DEFAULT 0,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        platformProductId TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE product_images (
        id TEXT PRIMARY KEY,
        productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL REFERENCES accounts(id),
        platform TEXT NOT NULL,
        orderNo TEXT NOT NULL,
        productId TEXT,
        productTitle TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        amount REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending_ship',
        expressCompany TEXT,
        trackingNumber TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE jobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        cron TEXT NOT NULL,
        accountId TEXT,
        config TEXT,
        isEnabled INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE job_runs (
        id TEXT PRIMARY KEY,
        jobId TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'running',
        startedAt TEXT NOT NULL DEFAULT (datetime('now')),
        finishedAt TEXT,
        result TEXT,
        error TEXT
      );

      CREATE TABLE llm_usage (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        accountId TEXT,
        feature TEXT NOT NULL,
        inputTokens INTEGER NOT NULL DEFAULT 0,
        outputTokens INTEGER NOT NULL DEFAULT 0,
        estimatedCost REAL NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE price_snapshots (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        keyword TEXT NOT NULL,
        item TEXT NOT NULL,
        capturedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE audit_logs (
        id TEXT PRIMARY KEY,
        accountId TEXT,
        action TEXT NOT NULL,
        beforeValue TEXT,
        afterValue TEXT,
        result TEXT,
        error TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
]

export function migrate(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const rows = db.prepare('SELECT id FROM schema_migrations').all() as { id: number }[]
  const applied = new Set(rows.map((r) => r.id))

  for (const m of migrations) {
    if (applied.has(m.id)) continue
    const apply = db.transaction(() => {
      db.exec(m.sql)
      db.prepare('INSERT INTO schema_migrations (id, name) VALUES (?, ?)').run(m.id, m.name)
    })
    apply()
  }
}
