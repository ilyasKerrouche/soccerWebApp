import Link from 'next/link'
import PlayerCard from '@/components/PlayerCard'
import FormDots from '@/components/FormDots'
import type { Player, PlayerHomeStats } from '@/lib/types'

/** "Il tuo riepilogo" in cima alla scheda Riepilogo, solo per giocatori approvati. */
export default function MySummary({ player, stats }: { player: Player; stats: PlayerHomeStats }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2.5">
        <h3 className="text-[15px] font-semibold">Il tuo riepilogo</h3>
        <Link href={`/players/${player.id}`} className="text-[12px]" style={{ color: '#5b9cff' }}>Profilo</Link>
      </div>
      <div className="flex items-center gap-3.5 rounded-2xl p-3.5" style={{ background: '#141d2b', border: '1px solid rgba(255,255,255,.08)' }}>
        <PlayerCard player={player} width={58} className="stadium-card-img" />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold truncate">{player.name}</div>
          <div className="text-[11px]" style={{ color: '#8a96a8' }}>
            {[player.position, `${stats.appearances} presenze`].filter(Boolean).join(' · ')}
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-2">
            {[
              { v: stats.goals, l: 'gol' },
              { v: stats.winRate === null ? '—' : `${Math.round(stats.winRate * 100)}%`, l: 'vittorie' },
              { v: stats.motm, l: 'MOTM' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div className="numeric text-[20px] font-semibold leading-none">{v}</div>
                <div className="text-[10px] mt-1" style={{ color: '#8a96a8' }}>{l}</div>
              </div>
            ))}
          </div>
          {stats.form.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px]" style={{ color: '#8a96a8' }}>
              Forma <FormDots form={stats.form} size={7} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
