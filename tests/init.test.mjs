import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readJson(p) {
  return JSON.parse(readFileSync(join(root, p), 'utf8'))
}

test('根 package.json 声明了正确的 workspaces', () => {
  const pkg = readJson('package.json')
  assert.deepEqual(pkg.workspaces, ['apps/*', 'packages/*'])
})

test('三个 workspace 包均存在且具备 build 脚本', () => {
  for (const p of ['apps/server', 'apps/web', 'packages/shared']) {
    assert.ok(existsSync(join(root, p, 'package.json')), `${p}/package.json 缺失`)
    const sub = readJson(`${p}/package.json`)
    assert.ok(sub.name, `${p} 缺少 name`)
    assert.equal(typeof sub.scripts.build, 'string', `${p} 缺少 build 脚本`)
  }
})

test('TypeScript / ESLint / Prettier 配置均存在', () => {
  for (const f of ['tsconfig.base.json', 'eslint.config.js', '.prettierrc.json']) {
    assert.ok(existsSync(join(root, f)), `${f} 缺失`)
  }
})

test('.env.example 存在且包含 LLM 与生图配置项', () => {
  const env = readFileSync(join(root, '.env.example'), 'utf8')
  assert.match(env, /LLM_PROVIDER/)
  assert.match(env, /IMAGE_PROVIDER/)
})
