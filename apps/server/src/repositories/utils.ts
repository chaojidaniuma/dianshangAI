import { getDb } from '../db/db.js'

export function updateRow(table: string, id: string, patch: object): boolean {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return true
  const set = entries.map(([k]) => `${k} = ?`).join(', ')
  const values = entries.map(([, v]) => v)
  const info = getDb()
    .prepare(`UPDATE ${table} SET ${set}, updatedAt = datetime('now') WHERE id = ?`)
    .run(...values, id)
  return info.changes > 0
}
