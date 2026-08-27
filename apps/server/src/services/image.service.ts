import { getImageProvider } from '../providers/image/provider.js'
import { generatePoster } from './poster.service.js'

export interface ProductImageInput {
  productId: string
  title: string
  price: number
  sellingPoints?: string[]
  imagePath?: string
}

// 优先 AI 生图，失败或关闭时回退本地海报
export async function generateProductImage(input: ProductImageInput): Promise<string> {
  const provider = getImageProvider()
  if (provider) {
    try {
      const r = await provider.generate({ prompt: `${input.title} 主图` })
      if (r.imageUrl) return r.imageUrl
    } catch {
      // 回退海报
    }
  }
  return generatePoster(input)
}
