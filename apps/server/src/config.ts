import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const rootDir = fileURLToPath(new URL('../../..', import.meta.url))

export const dataDir = join(rootDir, 'data')

export function getDbPath(): string {
  return process.env.DATABASE_PATH ?? join(dataDir, 'app.db')
}
