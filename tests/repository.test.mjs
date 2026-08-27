import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { createAccount, getAccountById, listAccounts, updateAccount, deleteAccount } = await import(
  '../apps/server/dist/repositories/account.repository.js'
)
const { createProduct, getProductById, listProducts, updateProduct, deleteProduct } = await import(
  '../apps/server/dist/repositories/product.repository.js'
)

test('account repository CRUD', () => {
  const acc = createAccount({ id: 'xy01', platform: 'xianyu', name: '闲鱼主号' })
  assert.equal(acc.id, 'xy01')
  assert.equal(getAccountById('xy01')?.name, '闲鱼主号')
  assert.equal(listAccounts().length, 1)

  updateAccount('xy01', { name: '闲鱼号2' })
  assert.equal(getAccountById('xy01')?.name, '闲鱼号2')

  assert.equal(deleteAccount('xy01'), true)
  assert.equal(getAccountById('xy01'), undefined)
})

test('product repository CRUD + 过滤', () => {
  createAccount({ id: 'xy01', platform: 'xianyu', name: '闲鱼主号' })
  const p = createProduct({
    accountId: 'xy01',
    platform: 'xianyu',
    title: '316 保温杯',
    price: 39.9,
    cost: 20,
  })
  assert.equal(getProductById(p.id)?.title, '316 保温杯')

  updateProduct(p.id, { price: 42.5 })
  assert.equal(getProductById(p.id)?.price, 42.5)

  assert.equal(listProducts({ platform: 'xianyu' }).length, 1)
  assert.equal(listProducts({ platform: 'pinduoduo' }).length, 0)
  assert.equal(listProducts({ accountId: 'xy01' }).length, 1)

  assert.equal(deleteProduct(p.id), true)
  assert.equal(getProductById(p.id), undefined)
})
