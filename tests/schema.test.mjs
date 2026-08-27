import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ProductCreateSchema,
  AccountCreateSchema,
  OrderSchema,
  PLATFORMS,
} from '../packages/shared/dist/index.js'

test('ProductCreateSchema 校验：合法数据通过，非法价格/平台拒绝', () => {
  const ok = ProductCreateSchema.safeParse({
    accountId: 'xy01',
    platform: 'xianyu',
    title: '316 保温杯',
    price: 39.9,
    cost: 20,
  })
  assert.equal(ok.success, true)

  assert.equal(
    ProductCreateSchema.safeParse({
      accountId: 'xy01',
      platform: 'xianyu',
      title: 'x',
      price: 0,
    }).success,
    false,
  )

  assert.equal(
    ProductCreateSchema.safeParse({
      accountId: 'xy01',
      platform: 'taobao',
      title: 'x',
      price: 1,
    }).success,
    false,
  )
})

test('ProductCreateSchema 默认 cost = 0', () => {
  const r = ProductCreateSchema.parse({
    accountId: 'xy01',
    platform: 'pinduoduo',
    title: 'x',
    price: 10,
  })
  assert.equal(r.cost, 0)
})

test('AccountCreateSchema 校验平台枚举', () => {
  for (const p of PLATFORMS) {
    assert.equal(
      AccountCreateSchema.safeParse({ id: 'a', platform: p, name: 'n' }).success,
      true,
    )
  }
  assert.equal(
    AccountCreateSchema.safeParse({ id: 'a', platform: 'jd', name: 'n' }).success,
    false,
  )
})

test('OrderSchema 默认数量/金额', () => {
  const o = OrderSchema.parse({ id: '1', accountId: 'xy01', platform: 'xianyu', orderNo: 'M1', status: 'pending_ship' })
  assert.equal(o.quantity, 1)
  assert.equal(o.amount, 0)
})
