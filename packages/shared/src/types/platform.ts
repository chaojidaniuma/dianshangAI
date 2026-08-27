export const PLATFORMS = ['xianyu', 'pinduoduo'] as const

export type Platform = (typeof PLATFORMS)[number]
