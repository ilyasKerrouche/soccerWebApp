import { C } from './ui'

/**
 * Sagome per le schermate di caricamento (app/../loading.tsx).
 * Ricalcano le pagine v2 (stesse misure di PageHeader, Card, Section, campo 3D),
 * cosi' quando arrivano i dati niente salta.
 */

/** Blocco grigio con la luce che scorre. */
export function Bone({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`sk rounded-md ${className}`} style={style} />
}

/** Contenitore della schermata: compare dopo un attimo, per non lampeggiare se i dati sono gia' pronti. */
export function SkScreen({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <main className={`sk-screen ${className}`} aria-busy="true" aria-label="Caricamento">
      {children}
    </main>
  )
}

/** Come PageHeader: titolo grande e riga piccola sotto. */
export function SkHeader({ titleWidth = 140, aside = false }: { titleWidth?: number; aside?: boolean }) {
  return (
    <header className="pt-5 flex items-end justify-between gap-4">
      <div>
        <Bone className="h-[26px] rounded-lg" style={{ width: titleWidth, marginTop: 3, marginBottom: 3 }} />
        <Bone className="h-3 w-32 mt-1.5" />
      </div>
      {aside && <Bone className="h-4 w-6 mb-1" />}
    </header>
  )
}

/** Come Card: stesso sfondo e bordo. */
export function SkCard({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`rounded-2xl ${className}`} style={{ background: C.surf, border: `1px solid ${C.line}` }}>{children}</div>
}

/** Come Section: titolo e contenuto. */
export function SkSection({ titleWidth = 110, children }: { titleWidth?: number; children: React.ReactNode }) {
  return (
    <section>
      <Bone className="h-[15px] mb-3" style={{ width: titleWidth }} />
      {children}
    </section>
  )
}

/** Righe di una Card a elenco (marcatori, risultati, storico). */
export function SkRows({ rows = 4, lead = false, rowHeight = 44 }: { rows?: number; lead?: boolean; rowHeight?: number }) {
  return (
    <SkCard className="overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3.5" style={{ height: rowHeight, borderTop: i > 0 ? `1px solid ${C.line}` : undefined }}>
          {lead && <Bone className="w-6 h-6 rounded-[7px] flex-shrink-0" />}
          <Bone className="h-3.5" style={{ width: `${[52, 38, 46, 30, 42, 34][i % 6]}%` }} />
          <Bone className="ml-auto h-4 w-6 flex-shrink-0" />
        </div>
      ))}
    </SkCard>
  )
}

/** Riquadri numerici come StatTile. */
export function SkTiles({ count = 4, cols = 2 }: { count?: number; cols?: 2 | 3 }) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkCard key={i} className="p-3">
          <Bone className="h-[22px] w-10" />
          <Bone className="h-2.5 w-16 mt-2" />
        </SkCard>
      ))}
    </div>
  )
}

/** Selettore a pillola. */
export function SkPills({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`flex gap-1 rounded-xl p-[3px] ${className}`} style={{ background: C.surf, border: `1px solid ${C.line}` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1 h-[31px] rounded-[9px] flex items-center justify-center" style={i === 0 ? { background: C.surf2 } : undefined}>
          <Bone className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  )
}

/** Sagoma di una card giocatore (proporzioni di PlayerCard). */
export function SkPlayerCard({ width }: { width: number }) {
  return <Bone className="rounded-xl" style={{ width, height: Math.round(width / 0.72) }} />
}

/** Risultato in cima a home e dettaglio partita: data, squadre e punteggio, esito. */
export function SkScore({ big = false }: { big?: boolean }) {
  return (
    <div className="px-4 text-center flex flex-col items-center">
      <Bone className="h-3 w-36" />
      <div className="flex items-center justify-center gap-3.5 mt-2">
        <Bone className="h-3.5 w-20" />
        <Bone className="rounded-lg" style={{ width: big ? 108 : 92, height: big ? 44 : 36 }} />
        <Bone className="h-3.5 w-20" />
      </div>
      <Bone className="h-3 w-28 mt-2" />
    </div>
  )
}

/** Il campo 3D: stessa altezza della scena vera, con il prato in prospettiva appena accennato. */
export function SkPitch() {
  return (
    <div className="relative" style={{ height: 296 }} aria-hidden>
      <div className="sk-pitch absolute inset-0" />
      <div className="sk absolute inset-0" style={{ clipPath: 'polygon(24% 10%, 76% 10%, 97% 94%, 3% 94%)', opacity: 0.6 }} />
      <div className="absolute left-[14%] right-[14%] h-px" style={{ top: '48%', background: 'rgba(255,255,255,.08)' }} />
    </div>
  )
}

/** Podio delle classifiche: 2°, 1°, 3°. */
export function SkPodium() {
  return (
    <div className="flex items-end justify-center gap-3" style={{ minHeight: 250 }}>
      {[78, 104, 78].map((w, i) => (
        <div key={i} className="flex flex-col items-center" style={{ flex: i === 1 ? '0 0 118px' : '0 0 92px' }}>
          <SkPlayerCard width={w} />
          <Bone className="h-3 mt-2.5" style={{ width: w - 24 }} />
          <Bone className={`mt-1.5 ${i === 1 ? 'h-[26px] w-9' : 'h-[19px] w-7'}`} />
          <div className="h-4 mt-1.5" />
        </div>
      ))}
    </div>
  )
}

/** Testa delle pagine giocatore e profilo: card grande al centro, nome, ruolo, forma. */
export function SkProfileHead({ cardWidth, eyebrow = false }: { cardWidth: number; eyebrow?: boolean }) {
  return (
    <div className="flex flex-col items-center px-4">
      {eyebrow && <Bone className="h-3 w-24 mb-3" />}
      <SkPlayerCard width={cardWidth} />
      <Bone className="h-6 w-40 mt-3 rounded-lg" />
      <Bone className="h-3 w-20 mt-2" />
      <Bone className="h-2 w-24 mt-3" />
    </div>
  )
}
