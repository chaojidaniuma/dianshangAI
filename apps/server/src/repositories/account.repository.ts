import { getDb } from '../db/db.js'
import { updateRow } from './utils.js'

export interface AccountRow {
  id: string
  platform: string
  name: string
  credential: string | null
  status: string
  isEnabled: number
  lastHealthCheckAt: string | null
  createdAt: string
  updatedAt: string
}

export interface NewAccount {
  id: string
  platform: string
  name: string
  credential?: string
}

export function createAccount(input: NewAccount): AccountRow {
  getDb()
    .prepare('INSERT INTO accounts (id, platform, name, credential) VALUES (?, ?, ?, ?)')
    .run(input.id, input.platform, input.name, input.credential ?? null)
  return getAccountById(input.id) as AccountRow
}

export function getAccountById(id: string): AccountRow | undefined {
  return getDb().prepare('SELECT * FROM accounts WHERE id = ?').get(id) as AccountRow | undefined
}

export function listAccounts(): AccountRow[] {
  return getDb().prepare('SELECT * FROM accounts ORDER BY createdAt').all() as AccountRow[]
}

export function updateAccount(
  id: string,
  patch: Partial<Omit<AccountRow, 'id' | 'createdAt' | 'updatedAt'>>,
): AccountRow | undefined {
  updateRow('accounts', id, patch)
  return getAccountById(id)
}

export function deleteAccount(id: string): boolean {
  return getDb().prepare('DELETE FROM accounts WHERE id = ?').run(id).changes > 0
}
