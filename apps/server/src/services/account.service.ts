import { AccountCreateSchema, AccountUpdateSchema, type Account, type Result } from '@ecom-agent/shared'
import { getAdapter } from '../adapters/index.js'
import * as accounts from '../repositories/account.repository.js'
import type { AccountRow } from '../repositories/account.repository.js'

function sanitize(row: AccountRow): Account {
  return {
    id: row.id,
    platform: row.platform as Account['platform'],
    name: row.name,
    status: row.status,
    isEnabled: row.isEnabled === 1,
    lastHealthCheckAt: row.lastHealthCheckAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function listAccounts(): Result<Account[]> {
  return { success: true, data: accounts.listAccounts().map(sanitize) }
}

export function createAccount(input: unknown): Result<Account> {
  const parsed = AccountCreateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, code: 'ACCOUNT_INVALID', message: parsed.error.issues[0]?.message ?? '参数错误' }
  }
  if (accounts.getAccountById(parsed.data.id)) {
    return { success: false, code: 'ACCOUNT_EXISTS', message: '账号已存在' }
  }
  return { success: true, data: sanitize(accounts.createAccount(parsed.data)) }
}

export function updateAccount(id: string, input: unknown): Result<Account> {
  const existing = accounts.getAccountById(id)
  if (!existing) {
    return { success: false, code: 'ACCOUNT_NOT_FOUND', message: '账号不存在' }
  }
  const parsed = AccountUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, code: 'ACCOUNT_INVALID', message: parsed.error.issues[0]?.message ?? '参数错误' }
  }
  const patch: Record<string, unknown> = { ...parsed.data }
  if (typeof patch.isEnabled === 'boolean') patch.isEnabled = patch.isEnabled ? 1 : 0
  const row = accounts.updateAccount(id, patch)
  return { success: true, data: sanitize(row as AccountRow) }
}

export function deleteAccount(id: string): Result<{ id: string }> {
  if (!accounts.getAccountById(id)) {
    return { success: false, code: 'ACCOUNT_NOT_FOUND', message: '账号不存在' }
  }
  accounts.deleteAccount(id)
  return { success: true, data: { id } }
}

export async function checkAccountHealth(id: string): Promise<Result<{ status: string; message: string }>> {
  const acc = accounts.getAccountById(id)
  if (!acc) {
    return { success: false, code: 'ACCOUNT_NOT_FOUND', message: '账号不存在' }
  }
  try {
    const r = await getAdapter(acc.platform).healthCheck(id)
    accounts.updateAccount(id, { status: r.status, lastHealthCheckAt: new Date().toISOString() })
    return { success: true, data: r }
  } catch (err) {
    accounts.updateAccount(id, { status: 'expired', lastHealthCheckAt: new Date().toISOString() })
    return { success: false, code: 'ACCOUNT_UNAUTHORIZED', message: (err as Error).message }
  }
}
