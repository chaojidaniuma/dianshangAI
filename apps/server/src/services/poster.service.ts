import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { dataDir } from '../config.js'

export interface PosterInput {
  productId: string
  title: string
  price: number
  sellingPoints?: string[]
  imagePath?: string
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }

function embedImage(imagePath: string | undefined): string {
  if (!imagePath) return ''
  try {
    const buf = readFileSync(imagePath)
    const mime = MIME[extname(imagePath).toLowerCase()] ?? 'image/jpeg'
    return `<image href="data:${mime};base64,${buf.toString('base64')}" x="40" y="40" width="720" height="500" preserveAspectRatio="xMidYMid slice"/>`
  } catch {
    return ''
  }
}

function buildSvg(input: PosterInput): string {
  const title = escapeXml(input.title.slice(0, 18))
  const points = escapeXml((input.sellingPoints ?? []).join(' ｜ ').slice(0, 40))
  const image = embedImage(input.imagePath)
  return `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="800" fill="#f5f5f7"/>
  ${image}
  <rect x="40" y="560" width="720" height="200" rx="12" fill="#ffffff"/>
  <text x="64" y="615" font-family="Microsoft YaHei, sans-serif" font-size="34" font-weight="bold" fill="#111111">${title}</text>
  <text x="64" y="690" font-family="Microsoft YaHei, sans-serif" font-size="52" font-weight="bold" fill="#e53e3e">¥${input.price}</text>
  <text x="64" y="732" font-family="Microsoft YaHei, sans-serif" font-size="24" fill="#666666">${points}</text>
</svg>`
}

export async function generatePoster(input: PosterInput): Promise<string> {
  const outDir = join(dataDir, 'images')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `${input.productId}.jpg`)
  await sharp(Buffer.from(buildSvg(input))).jpeg({ quality: 85 }).toFile(outPath)
  return outPath
}
