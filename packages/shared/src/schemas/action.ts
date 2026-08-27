import { z } from 'zod'

export const ACTION_NAMES = ['publish_product', 'ship_order'] as const

export const ActionPreviewSchema = z.object({
  action: z.enum(ACTION_NAMES),
  resourceId: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
})

export type ActionPreviewInput = z.infer<typeof ActionPreviewSchema>
