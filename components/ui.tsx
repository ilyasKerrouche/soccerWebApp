import Link from 'next/link'

/** Palette della v2 (la stessa della home). */
export const C = {
  bg: '#0d1420', surf: '#141d2b', surf2: '#1a2536', line: 'rgba(255,255,255,.08)',
  text: '#e8ecf2', muted: '#8a96a8', acc: '#5b9cff', gold: '#f5c451',
  win: '#4ade80', loss: '#f87171', draw: '#64748b',
}

export function Section({ title, link, children }: { title: string; link?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2.5">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {link && <Link href={link.href} className="text-[12px]" style={{ color: C.acc }}>{link.label}</Link>}
      </div>
      {children}
    </section>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl ${className}`} style={{ background: C.surf, border: `1px solid ${C.line}` }}>{children}</div>
}

/** Riquadro numerico: numero grande e etichetta grigia. */
export function StatTile({ value, label, tone }: { value: React.ReactNode; label: string; tone?: 'win' }) {
  return (
    <Card className="p-3 min-w-0">
      <div className="text-[22px] font-bold tabular-nums leading-none" style={tone === 'win' ? { color: C.win } : undefined}>{value}</div>
      <div className="text-[11px] mt-1.5 truncate" style={{ color: C.muted }}>{label}</div>
    </Card>
  )
}
