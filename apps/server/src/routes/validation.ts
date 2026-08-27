import { z } from 'zod'
import { PLATFORMS, type Result } from '@ecom-agent/shared'

export const IdParamSchema = z.object({ id: z.string().min(1) })

export const ProductListQuerySchema = z.object({
  accountId: z.string().optional(),
  platform: z.enum(PLATFORMS).optional(),
})

export const OrderListQuerySchema = z.object({
  accountId: z.string().optional(),
  status: z.string().optional(),
})

export const ImportBodySchema = z.object({
  filename: z.string().min(1),
  base64: z.string().min(1),
})

export function parse<T>(schema: z.ZodType<T>, value: unknown): Result<T> {
  const r = schema.safeParse(value)
  if (!r.success) {
    return { success: false, code: 'VALIDATION_ERROR', message: r.error.issues[0]?.message ?? '参数错误' }
  }
  return { success: true, data: r.data }
}
