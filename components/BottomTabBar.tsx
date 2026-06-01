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
  if (pathname.startsWith('/admin')) return null

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* Mobile: bottom fixed */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/8"
        style={{
          background: 'rgba(6,6,15,0.97)',
          backdropFilter: 'blur(20px)',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 pt-2 text-xs transition-colors text-center ${
              active(tab.href) ? 'text-brand' : 'text-white/30'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop: top fixed dentro il container */}
      <nav
        className="hidden md:flex fixed top-0 z-50 w-full max-w-md items-center justify-between px-6 border-b border-white/8"
        style={{
          background: 'rgba(6,6,15,0.97)',
          backdropFilter: 'blur(20px)',
          height: 56,
        }}
      >
        <div className="text-sm font-black text-white/50 tracking-widest">⚽</div>
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                active(tab.href)
                  ? 'bg-brand/15 text-brand'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/admin"
          className="text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors"
        >
          Admin ⚙️
        </Link>
      </nav>
    </>
  )
}
