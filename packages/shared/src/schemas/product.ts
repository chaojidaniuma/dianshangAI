import { z } from 'zod'
import { PLATFORMS } from '../types/platform.js'

export const ProductCreateSchema = z.object({
  accountId: z.string().min(1),
  platform: z.enum(PLATFORMS),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().min(0).default(0),
  category: z.string().optional(),
})

export const ProductUpdateSchema = ProductCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>
