// 每百万 tokens 价格（美元），仅用于估算费用，非精确计费。
// ponytail: 硬编码价格表，供应商调价时需手动更新，或后续改为从 API 返回 usage 精确计费。
const PRICE_PER_MILLION: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'deepseek-chat': { input: 0.27, output: 1.1 },
  'glm-4-flash': { input: 0, output: 0 },
  'qwen-plus': { input: 0.4, output: 1.2 },
}

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICE_PER_MILLION[model] ?? { input: 0.5, output: 1.5 }
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output
}
