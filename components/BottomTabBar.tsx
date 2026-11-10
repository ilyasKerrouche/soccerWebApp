'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { SEASON_PARAM, withSeason } from '@/lib/season'
import { getHeaderCard, type HeaderCard } from '@/app/profilo/actions'
import MusicButton from './MusicButton'

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
  // Cambia solo passando da/verso una pagina di AUTH_PATHS, non a ogni navigazione.
  // Nell'admin conta la pagina esatta: login e logout passano da /admin a /admin/login e viceversa.
  const authKey = pathname.startsWith('/admin')
    ? pathname
    : AUTH_PATHS.find((p) => pathname === p || pathname.startsWith(p + '/')) ?? 'other'

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
        background: 'rgba(13,20,32,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-stretch px-2" style={{ height: 52 }}>
        {/* La stagione scelta viaggia con i link. useSearchParams vuole un Suspense: alcune pagine (es. /accedi) sono statiche. */}
        <Suspense fallback={<TabLinks active={active} season={null} />}>
          <SeasonTabLinks active={active} />
        </Suspense>

        <div className="flex items-center flex-shrink-0 pl-1">
          <MusicButton />
        </div>
        <div className="flex items-center justify-end flex-shrink-0 pl-2 pr-1 min-w-[56px] max-w-[96px]">
          {headerCard === undefined ? null : headerCard === null ? (
            <Link href="/accedi" className="text-[12px] font-medium text-white/60 hover:text-white transition-colors">
              Accedi
            </Link>
          ) : headerCard.status === 'admin' ? (
            <Link
              href="/admin"
              className={`text-[12px] transition-colors ${isAdmin ? 'text-brand font-semibold' : 'text-white/60 font-medium hover:text-white'}`}
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/profilo"
              aria-label="Il tuo profilo"
              className={`text-[12px] truncate transition-colors ${
                pathname === '/profilo' ? 'text-white font-semibold' : 'text-brand font-medium hover:text-white'
              }`}
            >
              {headerCard.status === 'approved' ? headerCard.name : 'Profilo'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function SeasonTabLinks({ active }: { active: (href: string) => boolean }) {
  return <TabLinks active={active} season={useSearchParams().get(SEASON_PARAM)} />
}

function TabLinks({ active, season }: { active: (href: string) => boolean; season: string | null }) {
  return (
    <>
      {/* Le voci si accendono con la stessa linea sotto usata dalle classifiche. */}
      {tabs.map((tab) => {
        const isActive = active(tab.href)
        return (
          <Link
            key={tab.href}
            href={withSeason(tab.href, season)}
            className={`relative flex-1 min-w-0 flex items-center justify-center text-[12px] whitespace-nowrap transition-colors ${
              isActive ? 'text-white font-semibold' : 'text-muted font-medium hover:text-white'
            }`}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute left-2 right-2 bottom-0 h-[2px] rounded-full"
                style={{ background: '#5b9cff' }}
              />
            )}
          </Link>
        )
      })}
    </>
  )
}
