import { z } from 'zod'
import { PLATFORMS } from '../types/platform.js'

export const OrderSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  platform: z.enum(PLATFORMS),
  orderNo: z.string().min(1),
  productId: z.string().optional(),
  productTitle: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  amount: z.number().min(0).default(0),
  status: z.string().min(1),
})

export type Order = z.infer<typeof OrderSchema>
