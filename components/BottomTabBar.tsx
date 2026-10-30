'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { getHeaderCard, type HeaderCard } from '@/app/profilo/actions'

const tabs = [
  { href: '/', label: 'Home' },
  { href: '/matches', label: 'Partite' },
  { href: '/stats', label: 'Statistiche' },
]

// Pagine dove lo stato di login cambia: entrando o uscendo da una di queste si rilegge la card
const AUTH_PATHS = ['/accedi', '/registrati', '/profilo', '/reimposta-password', '/password-dimenticata']

export default function BottomTabBar() {
  const pathname = usePathname()
  // undefined = in caricamento: si riserva lo spazio per non far saltare l'header.
  const [headerCard, setHeaderCard] = useState<HeaderCard | null | undefined>(undefined)
  // Cambia solo passando da/verso una pagina di AUTH_PATHS, non a ogni navigazione
  const authKey = AUTH_PATHS.find((p) => pathname === p || pathname.startsWith(p + '/')) ?? 'other'

  useEffect(() => {
    let cancelled = false
    const load = () =>
      getHeaderCard()
        .then((c) => { if (!cancelled) setHeaderCard(c) })
        .catch(() => { if (!cancelled) setHeaderCard(null) })
    load()
    // Dopo un nuovo caricamento la miniatura va riletta.
    window.addEventListener('calcetto:card-updated', load)
    return () => {
      cancelled = true
      window.removeEventListener('calcetto:card-updated', load)
    }
  }, [authKey])
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

        <div className="flex items-center justify-center flex-shrink-0 pl-2" style={{ width: 44 }}>
          {headerCard === undefined ? null : headerCard === null ? (
            <Link href="/accedi" className="text-[12px] font-medium text-white/60 hover:text-white transition-colors">
              Accedi
            </Link>
          ) : headerCard.status === 'pending' ? (
            <Link
              href="/profilo"
              aria-label="Il tuo profilo"
              className="flex items-center justify-center w-7 h-7 rounded-full glass text-[14px]"
            >
              👤
            </Link>
          ) : (
            <Link href="/profilo" aria-label="Il tuo profilo">
              <PlayerCard
                player={{
                  id: '',
                  ovr: null,
                  is_active: true,
                  created_at: '',
                  name: headerCard.name,
                  card_url: headerCard.card_url,
                  position: headerCard.position,
                }}
                width={22}
              />
            </Link>
          )}
        </div>

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
