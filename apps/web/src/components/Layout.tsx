import { NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: '首页' },
  { to: '/products', label: '商品' },
  { to: '/orders', label: '订单' },
  { to: '/accounts', label: '账号' },
  { to: '/jobs', label: '任务' },
  { to: '/analytics', label: '数据' },
  { to: '/settings', label: '设置' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-52 shrink-0 border-r border-gray-200 bg-white p-4">
        <div className="mb-6 text-lg font-semibold">掌柜助手</div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-blue-50 font-medium text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
