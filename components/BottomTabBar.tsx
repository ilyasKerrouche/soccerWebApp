'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Home' },
  { href: '/matches', label: 'Partite' },
  { href: '/stats', label: 'Statistiche' },
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
        background: 'rgba(6,6,15,0.9)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-stretch px-2" style={{ height: 52 }}>
        {/* Le voci si accendono con la stessa linea sotto usata dalle classifiche. */}
        {tabs.map((tab) => {
          const isActive = active(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex-1 min-w-0 flex items-center justify-center text-[12px] whitespace-nowrap transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-white/35 font-medium hover:text-white/60'
              }`}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute left-2 right-2 bottom-0 h-[2px] rounded-full"
                  style={{ background: '#a78bfa' }}
                />
              )}
            </Link>
          )
        })}

        <Link
          href="/admin"
          aria-label="Admin"
          className={`flex items-center justify-center pl-3 pr-1 text-[12px] flex-shrink-0 transition-colors ${
            isAdmin ? 'text-brand font-semibold' : 'text-white/20 hover:text-white/40'
          }`}
        >
          Admin
        </Link>
      </div>
    </nav>
  )
}
