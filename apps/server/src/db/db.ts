import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { dbPath } from '../config.js'
import { migrate } from './migrations.js'

type DB = InstanceType<typeof Database>

let db: DB | null = null

export function getDb(): DB {
  if (db) return db
  mkdirSync(dirname(dbPath), { recursive: true })
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  return db
}
