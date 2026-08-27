import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, rmSync } from 'node:fs'
import sharp from 'sharp'
import { generatePoster } from '../apps/server/dist/services/poster.service.js'
import { generateProductImage } from '../apps/server/dist/services/image.service.js'

test('generatePoster 生成 800x800 图片', async () => {
  const out = await generatePoster({
    productId: 'test-poster',
    title: '316 保温杯',
    price: 39.9,
    sellingPoints: ['现货秒发', '价格实惠'],
  })
  assert.ok(existsSync(out))
  const meta = await sharp(out).metadata()
  assert.equal(meta.width, 800)
  assert.equal(meta.height, 800)
  rmSync(out, { force: true })
})

test('generateProductImage 关闭生图时回退海报', async () => {
  const out = await generateProductImage({ productId: 'test-fallback', title: '杯子', price: 20 })
  assert.ok(existsSync(out))
  const meta = await sharp(out).metadata()
  assert.equal(meta.width, 800)
  rmSync(out, { force: true })
})
