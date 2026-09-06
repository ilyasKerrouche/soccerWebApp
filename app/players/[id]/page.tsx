import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlayerProfile } from '@/lib/queries/players'
import PlayerCard from '@/components/PlayerCard'
import FormDots from '@/components/FormDots'
import SwipeBack from '@/components/SwipeBack'

export const revalidate = 60

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const data = await getPlayerProfile(params.id)
  if (!data) notFound()

  const { player, matches, goalkeeper_stats } = data
  const maxGoals = Math.max(...matches.map(m => m.goals), 1)

  return (
    <main className="pb-6">
      <SwipeBack />
      <div className="px-4">
        <Link href="/stats" className="text-[13px] text-white/35 hover:text-white/60 inline-block pt-6 transition-colors">
          ‹ Statistiche
        </Link>

        <div className="flex items-end gap-4 mt-4">
          <div className="w-20 flex-shrink-0" style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.7))' }}>
            <PlayerCard player={player} width={80} />
          </div>
          <div className="min-w-0 pb-0.5">
            <h1 className="text-[26px] font-bold tracking-[-0.02em] leading-tight truncate">{player.name}</h1>
            {player.position && <div className="text-[13px] text-white/35 mt-0.5">{player.position}</div>}
            {player.record && player.record.form.length > 0 && (
              <div className="mt-2"><FormDots form={player.record.form} size={7} /></div>
            )}
          </div>
        </div>

        <div className="flex rule mt-5 pt-3 pb-1">
          {[
            { v: player.total_goals, l: 'gol' },
            { v: player.total_appearances, l: 'presenze' },
            { v: player.total_appearances > 0 ? (player.total_goals / player.total_appearances).toFixed(1) : '0', l: 'a partita' },
            ...(player.record && player.record.played > 0
              ? [{ v: `${Math.round(player.record.win_rate * 100)}%`, l: `${player.record.wins}V ${player.record.draws}N ${player.record.losses}P` }]
              : []),
          ].map(({ v, l }) => (
            <div key={l} className="flex-1 text-center min-w-0">
              <div className="text-xl font-semibold text-white/85 leading-none tracking-[-0.02em]">{v}</div>
              <div className="text-[10px] text-white/30 mt-1 truncate">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {goalkeeper_stats && (
        <div className="px-4">
          <div className="flex rule pt-3 pb-1">
            {[
              { v: goalkeeper_stats.avg_conceded, l: 'subiti a partita' },
              { v: goalkeeper_stats.goals_conceded, l: 'gol subiti' },
              { v: goalkeeper_stats.clean_sheets, l: 'porta inviolata' },
            ].map(({ v, l }) => (
              <div key={l} className="flex-1 text-center min-w-0">
                <div className="text-xl font-semibold leading-none tracking-[-0.02em] text-win">{v}</div>
                <div className="text-[10px] text-white/30 mt-1 truncate">{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pt-5 flex flex-col gap-5">

        {/* Goal per partita — trend */}
        {matches.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-white/45 mb-4">Goal per partita</h2>
            <div className="flex items-end gap-[3px] h-16">
              {[...matches].reverse().map((m) => {
                // Le barre a zero restano un moncone sulla linea di base: assente
                // e' diverso da zero, e va comunque visto.
                const h = m.goals === 0 ? 2 : Math.max(6, Math.round((m.goals / maxGoals) * 60))
                const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
                return (
                  <div key={m.id} className="flex-1 flex flex-col items-center justify-end h-full">
                    {/* Nessuna etichetta sulle barre: con numeri piccoli i pari
                        merito sono la norma e finirebbero su quasi tutte. I valori
                        esatti stanno nello storico qui sotto. */}
                    <div
                      className="w-full"
                      title={`${date}: ${m.goals} ${m.goals === 1 ? 'gol' : 'gol'}`}
                      style={{
                        height: h,
                        borderRadius: '4px 4px 0 0',
                        background: m.goals > 0 ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="text-[10px] text-white/25 mt-2">Ultime {matches.length} partite, dalla più vecchia</div>
          </section>
        )}

        {/* Storico partite */}
        <section>
          <div className="text-[13px] font-semibold text-white/45 mb-2">Storico partite</div>
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
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {m.goals > 0 && (
                        <div className="flex items-center gap-0.5">
                          <span className="text-sm font-black text-brand">{m.goals}</span>
                          <span className="text-xs">⚽</span>
                        </div>
                      )}
                      {m.own_goals > 0 && (
                        <div className="flex items-center gap-0.5">
                          <span className="text-sm font-black text-red-400">{m.own_goals}</span>
                          <span className="text-[10px] font-black text-red-400/70">OG</span>
                        </div>
                      )}
                    </div>
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
