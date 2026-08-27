import type { FastifyInstance } from 'fastify'
import * as products from '../repositories/product.repository.js'
import { productsToRows, toCsv } from '../services/export.service.js'
import { importProducts, parseSpreadsheet } from '../services/import.service.js'

export async function importExportRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/products/import', async (req, reply) => {
    const { filename, base64 } = req.body as { filename?: string; base64?: string }
    if (!filename || !base64) {
      reply.code(400)
      return { success: false, code: 'INVALID', message: '缺少文件' }
    }
    let rows: Record<string, unknown>[]
    try {
      rows = parseSpreadsheet(filename, base64)
    } catch {
      reply.code(400)
      return { success: false, code: 'PARSE_FAILED', message: '文件解析失败' }
    }
    const result = importProducts(rows)
    return { success: true, data: { imported: result.imported.length, errors: result.errors } }
  })

  app.get('/api/export/products', async (_req, reply) => {
    const csv = toCsv(productsToRows(products.listProducts()), [
      '标题',
      '平台',
      '账号',
      '售价',
      '成本',
      '目录',
      '状态',
      '更新时间',
    ])
    reply.header('Content-Type', 'text/csv; charset=utf-8')
    reply.header('Content-Disposition', 'attachment; filename="products.csv"')
    return csv
  })
}
