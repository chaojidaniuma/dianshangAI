import type { LLMProvider, MarketItem } from '@ecom-agent/shared'
import { getLlmProvider } from '../providers/llm/provider.js'
import { estimateCost } from '../providers/llm/pricing.js'
import { createUsage } from '../repositories/usage.repository.js'

export interface PriceStats {
  min: number
  max: number
  avg: number
  median: number
  count: number
}

export interface PricingResult {
  stats: PriceStats
  suggestedPrice: number
  margin: number | null
}

export function grossMargin(price: number, cost: number): number {
  return price > 0 ? (price - cost) / price : 0
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function analyzeMarket(items: MarketItem[], cost?: number): PricingResult {
  const prices = items.map((i) => i.price).sort((a, b) => a - b)
  const min = prices[0] ?? 0
  const max = prices[prices.length - 1] ?? 0
  const avg = prices.length ? round2(prices.reduce((s, p) => s + p, 0) / prices.length) : 0
  const mid = Math.floor(prices.length / 2)
  const median = prices.length
    ? round2(prices.length % 2 === 1 ? prices[mid]! : (prices[mid - 1]! + prices[mid]!) / 2)
    : 0
  const suggestedPrice = round2(avg * 0.95)
  const margin = cost !== undefined ? grossMargin(suggestedPrice, cost) : null
  return { stats: { min, max, avg, median, count: prices.length }, suggestedPrice, margin }
}

function ruleExplain(result: PricingResult, cost?: number): string {
  const m = result.margin
  return cost !== undefined && m !== null
    ? `市场均价 ${result.stats.avg} 元，建议定价 ${result.suggestedPrice} 元，预计毛利 ${(m * 100).toFixed(0)}%。`
    : `市场均价 ${result.stats.avg} 元，建议定价 ${result.suggestedPrice} 元。`
}

export async function explainPricing(
  result: PricingResult,
  cost: number | undefined,
  provider: LLMProvider | null = getLlmProvider(),
): Promise<string> {
  if (!provider) return ruleExplain(result, cost)
  try {
    const prompt = `市场数据：最低 ${result.stats.min} 元，最高 ${result.stats.max} 元，均价 ${result.stats.avg} 元，中位数 ${result.stats.median} 元。程序建议价 ${result.suggestedPrice} 元${cost !== undefined ? `，成本 ${cost} 元` : ''}。请用一句话说明定价理由与策略。`
    const r = await provider.chat({ messages: [{ role: 'user', content: prompt }] })
    createUsage({
      provider: process.env.LLM_PROVIDER ?? 'custom',
      model: r.model,
      feature: 'pricing',
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      estimatedCost: estimateCost(r.model, r.inputTokens, r.outputTokens),
    })
    return r.content || ruleExplain(result, cost)
  } catch {
    return ruleExplain(result, cost)
  }
}
