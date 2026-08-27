import type { PlatformAdapter } from '@ecom-agent/shared'

// 拼多多开放平台适配器（骨架）。
// 接入前需确认：官方开放平台应用授权、CLIENT_ID/SECRET/ACCESS_TOKEN、当前可用接口与权限。
// 第一批接口：授权 / 商品读取 / 商品发布 / 订单读取 / 发货（投流与调价后续）。
// 本期不接入真实 API——需凭据与官方接口确认，接入完成前所有调用抛错。
export const PDD_CAPABILITIES = [
  'auth',
  'read_products',
  'publish_product',
  'read_orders',
  'ship',
] as const

const pending = (): never => {
  throw new Error('拼多多真实接入待完成（需官方接口确认 + 凭据）')
}

export const pinduoduoAdapter: PlatformAdapter = {
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
