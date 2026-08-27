import * as XLSX from 'xlsx'
import type { Product } from '@ecom-agent/shared'

export function toCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  return '\uFEFF' + XLSX.utils.sheet_to_csv(ws)
}

export function productsToRows(list: Product[]): Record<string, unknown>[] {
  return list.map((p) => ({
    标题: p.title,
    平台: p.platform === 'xianyu' ? '闲鱼' : '拼多多',
    账号: p.accountId,
    售价: p.price,
    成本: p.cost,
    目录: p.category ?? '',
    状态: p.status,
    更新时间: p.updatedAt,
  }))
}
