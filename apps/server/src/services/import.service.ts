import * as XLSX from 'xlsx'
import { ProductCreateSchema, type Product } from '@ecom-agent/shared'
import * as accounts from '../repositories/account.repository.js'
import * as products from '../repositories/product.repository.js'

const HEADER_MAP: Record<string, string> = {
  标题: 'title',
  价格: 'price',
  成本: 'cost',
  图片路径: 'imagePath',
  目录: 'category',
  平台: 'platform',
  账号: 'accountId',
  描述: 'description',
}

const PLATFORM_LABEL: Record<string, string> = { 闲鱼: 'xianyu', 拼多多: 'pinduoduo' }

export interface ImportError {
  row: number
  message: string
}

export interface ImportResult {
  imported: Product[]
  errors: ImportError[]
}

export function parseSpreadsheet(filename: string, base64: string): Record<string, unknown>[] {
  const buffer = Buffer.from(base64, 'base64')
  const isCsv = filename.toLowerCase().endsWith('.csv')
  const wb = isCsv ? XLSX.read(buffer.toString('utf8'), { type: 'string' }) : XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]!]!
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
}

export function importProducts(rows: Record<string, unknown>[]): ImportResult {
  const imported: Product[] = []
  const errors: ImportError[] = []

  rows.forEach((raw, index) => {
    const mapped: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(raw)) {
      const field = HEADER_MAP[key.trim()] ?? key.trim()
      mapped[field] = value
    }

    const platformRaw = String(mapped.platform ?? '')
    const platform = PLATFORM_LABEL[platformRaw] ?? platformRaw
    const input = {
      accountId: String(mapped.accountId ?? 'demo'),
      platform,
      title: String(mapped.title ?? ''),
      price: Number(mapped.price),
      cost: mapped.cost === '' || mapped.cost === undefined ? 0 : Number(mapped.cost),
      description: mapped.description ? String(mapped.description) : undefined,
      category: mapped.category ? String(mapped.category) : undefined,
    }

    const parsed = ProductCreateSchema.safeParse(input)
    if (!parsed.success) {
      errors.push({ row: index + 2, message: parsed.error.issues[0]?.message ?? '参数错误' })
      return
    }
    if (!accounts.getAccountById(parsed.data.accountId)) {
      errors.push({ row: index + 2, message: `账号 ${parsed.data.accountId} 不存在` })
      return
    }
    imported.push(products.createProduct(parsed.data))
  })

  return { imported, errors }
}
