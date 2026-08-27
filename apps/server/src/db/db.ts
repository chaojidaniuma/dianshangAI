import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { getDbPath } from '../config.js'
import { migrate } from './migrations.js'

type DB = InstanceType<typeof Database>

let db: DB | null = null

export function getDb(): DB {
  if (db) return db
  const path = getDbPath()
  mkdirSync(dirname(path), { recursive: true })
  db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  return db
}
