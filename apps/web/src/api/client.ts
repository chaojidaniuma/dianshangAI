import type { Result } from '@ecom-agent/shared'

export async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init })
  const body = (await res.json().catch(() => null)) as Result<T> | null
  if (!body || !body.success) {
    const message = body && !body.success ? body.message : `请求失败 (${res.status})`
    throw new Error(message)
  }
  return body.data
}
