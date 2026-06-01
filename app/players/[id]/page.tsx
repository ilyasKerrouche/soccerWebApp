import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlayerProfile } from '@/lib/queries/players'
import PlayerCard from '@/components/PlayerCard'
import SwipeBack from '@/components/SwipeBack'

export const revalidate = 60

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const data = await getPlayerProfile(params.id)
  if (!data) notFound()

  const { player, matches } = data
  const maxGoals = Math.max(...matches.map(m => m.goals), 1)

  return (
    <main className="pb-6">
      <SwipeBack />
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-10 pb-8" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}>
        <div className="absolute -top-10 -right-8 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.35) 0%,transparent 70%)' }} />
        <div className="relative z-10">
          <Link href="/stats" className="text-white/40 hover:text-white text-sm mb-4 inline-block transition-colors">‹ Stats</Link>
          <div className="flex items-end gap-5">
            <div className="w-24 rounded-xl overflow-hidden shadow-2xl flex-shrink-0" style={{ boxShadow: '0 0 30px rgba(167,139,250,0.3)' }}>
              <PlayerCard player={player} width={96} />
            </div>
            <div>
              <div className="text-2xl font-black mb-1">{player.name}</div>
              {player.position && <div className="text-xs text-brand/70 font-bold uppercase tracking-wider mb-3">{player.position}</div>}
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-2xl font-black text-brand leading-none">{player.total_goals}</div>
                  <div className="text-[9px] text-white/35 mt-0.5">goal</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white/70 leading-none">{player.total_appearances}</div>
                  <div className="text-[9px] text-white/35 mt-0.5">presenze</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white/70 leading-none">
                    {player.total_appearances > 0 ? (player.total_goals / player.total_appearances).toFixed(1) : '0'}
                  </div>
                  <div className="text-[9px] text-white/35 mt-0.5">media</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">

        {/* Goal per partita — trend */}
        {matches.length > 0 && (
          <section>
            <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-6 font-bold">Goal per partita</div>
            <div className="flex items-end gap-1.5 h-16">
              {[...matches].reverse().map((m) => {
                const h = m.goals === 0 ? 4 : Math.round((m.goals / maxGoals) * 56) + 8
                return (
                  <div key={m.id} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: h,
                        background: m.goals > 0 ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.08)',
                        boxShadow: m.goals > 0 ? '0 0 8px rgba(167,139,250,0.4)' : 'none',
                      }}
                    />
                    {m.goals > 0 && <div className="text-[8px] font-black text-brand/70">{m.goals}</div>}
                  </div>
                )
              })}
            </div>
            <div className="text-[8px] text-white/20 text-center mt-3">ultime {matches.length} partite</div>
          </section>
        )}

        {/* Storico partite */}
        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">Storico partite</div>
          {matches.length === 0 && (
            <p className="text-white/25 text-sm text-center py-6">Nessuna partita ancora.</p>
          )}
          <div className="flex flex-col gap-2">
            {matches.map((m) => {
              const team = (m as unknown as { playerTeam: 'a' | 'b' | null }).playerTeam
              const sa = m.score_a ?? 0
              const sb = m.score_b ?? 0
              const aWins = sa > sb
              const bWins = sb > sa
              const isDraw = sa === sb
              const playerWins = !isDraw && ((team === 'a' && aWins) || (team === 'b' && bWins))
              const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

              return (
                <Link key={m.id} href={`/matches/${m.id}`}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-brand/20" style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${playerWins ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    {/* Esito */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                      playerWins ? 'bg-win/15 text-win' : isDraw ? 'bg-white/5 text-white/35' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {playerWins ? 'V' : isDraw ? 'P' : 'S'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">
                        <span className={aWins ? 'text-win' : 'text-white/40'}>{m.score_a}</span>
                        <span className="text-white/20 mx-1">–</span>
                        <span className={!aWins ? 'text-win' : 'text-white/40'}>{m.score_b}</span>
                      </div>
                      <div className="text-[9px] text-white/25">{date}</div>
                    </div>
                    {/* Goal */}
                    {m.goals > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-sm font-black text-brand">{m.goals}</span>
                        <span className="text-xs">⚽</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
