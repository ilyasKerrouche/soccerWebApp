'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/matches', label: 'Partite', icon: '⚽' },
  { href: '/stats', label: 'Stats', icon: '📊' },
]

export default function BottomTabBar() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  const active = (href: string) =>
    !isAdmin && (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <nav
      className="fixed top-0 left-0 right-0 md:left-auto md:right-auto md:max-w-md md:w-full z-50"
      style={{
        background: 'rgba(6,6,15,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-center h-13 px-2" style={{ height: 52 }}>
        {/* Logo */}
        <div className="flex items-center gap-1.5 px-2 flex-shrink-0">
          <span className="text-base">⚽</span>
          <span className="text-[11px] font-black tracking-widest text-white/30 uppercase">Calcetto</span>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {tabs.map((tab) => {
            const isActive = active(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: isActive ? 'rgba(167,139,250,0.15)' : 'transparent',
                  color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                }}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                    style={{ background: '#a78bfa' }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Admin */}
        <Link
          href="/admin"
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-bold flex-shrink-0 transition-all"
          style={{
            background: isAdmin ? 'rgba(167,139,250,0.15)' : 'transparent',
            color: isAdmin ? '#a78bfa' : 'rgba(255,255,255,0.25)',
          }}
        >
          <span>⚙️</span>
          <span>Admin</span>
        </Link>
      </div>
    </nav>
  )
}
