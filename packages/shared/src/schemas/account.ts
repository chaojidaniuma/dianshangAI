import { z } from 'zod'
import { PLATFORMS } from '../types/platform.js'

export const AccountCreateSchema = z.object({
  id: z.string().min(1),
  platform: z.enum(PLATFORMS),
  name: z.string().min(1),
  credential: z.string().optional(),
})

export type AccountCreateInput = z.infer<typeof AccountCreateSchema>

export const AccountUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  credential: z.string().optional(),
  isEnabled: z.boolean().optional(),
  status: z.string().optional(),
})

export type AccountUpdateInput = z.infer<typeof AccountUpdateSchema>
