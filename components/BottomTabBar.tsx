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
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      className="fixed top-0 left-0 right-0 md:left-auto md:right-auto md:max-w-md md:w-full z-50 flex items-center border-b border-white/8"
      style={{
        background: 'rgba(6,6,15,0.97)',
        backdropFilter: 'blur(20px)',
        height: 52,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Mobile & desktop: stessa nav in cima */}
      <div className="flex-1 flex items-center">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-bold transition-colors ${
              !isAdmin && active(tab.href) ? 'text-brand' : 'text-white/30'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
      <Link
        href="/admin"
        className={`px-4 text-[11px] font-bold transition-colors ${isAdmin ? 'text-brand' : 'text-white/25 hover:text-white/60'}`}
      >
        ⚙️
      </Link>
    </nav>
  )
}
