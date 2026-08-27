import { getDb } from './db/db.js'

export function seedDefaultAccount(): void {
  const db = getDb()
  const count = (db.prepare('SELECT COUNT(*) AS c FROM accounts').get() as { c: number }).c
  if (count > 0) return
  db.prepare('INSERT INTO accounts (id, platform, name, status) VALUES (?, ?, ?, ?)').run(
    'demo',
    'xianyu',
    '体验账号',
    'ok',
  )
}
