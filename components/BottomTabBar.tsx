'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/matches', label: 'Partite', icon: '⚽' },
  { href: '/players', label: 'Giocatori', icon: '👥' },
  { href: '/stats', label: 'Stats', icon: '📊' },
]

export default function BottomTabBar() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/7"
      style={{
        background: 'rgba(10,15,10,0.96)',
        backdropFilter: 'blur(16px)',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center gap-1 pt-2 text-xs transition-colors ${
              active ? 'text-brand' : 'text-white/30'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
