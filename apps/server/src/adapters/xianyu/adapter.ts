import type { PlatformAdapter } from '@ecom-agent/shared'

// 闲鱼适配器（骨架）：mtop 逆向（Cookie + 签名，约 24h 过期）。
// 接入前需确认：当前可用的 mtop 接口与签名算法、用户 Cookie、健康检测方式。
// 本期不接入真实 API，也不开发验证码绕过/风控对抗/刷量。接入完成前所有调用抛错。
const pending = (): never => {
  throw new Error('闲鱼真实接入待完成（需 mtop 接口确认 + Cookie）')
}

export const xianyuAdapter: PlatformAdapter = {
  async healthCheck() {
    return pending()
  },
  async searchMarket() {
    return pending()
  },
  async createProduct() {
    return pending()
  },
  async listProducts() {
    return pending()
  },
  async listOrders() {
    return pending()
  },
  async shipOrder() {
    return pending()
  },
}
