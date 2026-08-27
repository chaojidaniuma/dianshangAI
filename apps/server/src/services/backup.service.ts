import AdmZip from 'adm-zip'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir } from '../config.js'

export interface BackupResult {
  filename: string
  size: number
  path: string
}

// 备份 SQLite + 图片 + 导出目录到 zip。恢复流程后续实现（停止任务→校验→恢复→重启）。
export function createBackup(): BackupResult {
  const backupDir = join(dataDir, 'backups')
  mkdirSync(backupDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `backup-${ts}.zip`
  const outPath = join(backupDir, filename)

  const zip = new AdmZip()
  const db = join(dataDir, 'app.db')
  if (existsSync(db)) zip.addLocalFile(db)
  const images = join(dataDir, 'images')
  if (existsSync(images)) zip.addLocalFolder(images, 'images')
  const exportsDir = join(dataDir, 'exports')
  if (existsSync(exportsDir)) zip.addLocalFolder(exportsDir, 'exports')
  zip.writeZip(outPath)

  return { filename, size: statSync(outPath).size, path: outPath }
}
