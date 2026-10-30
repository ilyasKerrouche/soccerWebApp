import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlayerProfile } from '@/lib/queries/players'
import PlayerCard from '@/components/PlayerCard'
import FormDots from '@/components/FormDots'
import { getMotmCounts } from '@/lib/queries/motm'
import MotmCounter from '@/components/motm/MotmCounter'
import SwipeBack from '@/components/SwipeBack'
import { C, Card, Section, StatTile } from '@/components/ui'

export const revalidate = 60

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const data = await getPlayerProfile(params.id)
  if (!data) notFound()

  const { player, matches, goalkeeper_stats } = data
  let motmCount = 0
  try {
    motmCount = (await getMotmCounts())[player.id] ?? 0
  } catch (e) {
    console.error('MOTM counts failed', e)
  }
  const maxGoals = Math.max(...matches.map(m => m.goals), 1)

  const tiles = [
    { v: player.total_goals, l: 'gol' },
    { v: player.total_appearances, l: 'presenze' },
    { v: player.total_appearances > 0 ? (player.total_goals / player.total_appearances).toFixed(1).replace('.', ',') : '0', l: 'gol a partita' },
    ...(player.record && player.record.played > 0
      ? [{ v: `${Math.round(player.record.win_rate * 100)}%`, l: `vittorie · ${player.record.wins}V ${player.record.draws}N ${player.record.losses}P` }]
      : []),
  ]

  return (
    <main className="pb-6">
      <SwipeBack />
      <Link href="/stats" className="text-[13px] inline-block px-4 pt-4 transition-opacity hover:opacity-80" style={{ color: C.acc }}>
        ‹ Statistiche
      </Link>

      {/* La card e' la protagonista: grande, al centro, con una luce blu leggera */}
      <div className="text-center px-4 pt-2.5" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(91,156,255,.14) 0%, transparent 62%)' }}>
        <div className="inline-block" style={{ width: 118, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.6))' }}>
          <PlayerCard player={player} width={118} eager />
        </div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em] leading-tight mt-2.5 truncate">{player.name}</h1>
        {player.position && <div className="text-[13px]" style={{ color: C.muted }}>{player.position}</div>}
        {motmCount >= 1 && <div className="mt-2"><MotmCounter count={motmCount} /></div>}
        {player.record && player.record.form.length > 0 && (
          <div className="mt-2.5 flex justify-center"><FormDots form={player.record.form} size={7} /></div>
        )}
      </div>

      <div className="px-4 pt-5 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {tiles.map(({ v, l }) => <StatTile key={l} value={v} label={l} />)}
          </div>
          {goalkeeper_stats && (
            <div className="grid grid-cols-3 gap-2">
              <StatTile tone="win" value={String(goalkeeper_stats.avg_conceded).replace('.', ',')} label="subiti a partita" />
              <StatTile tone="win" value={goalkeeper_stats.goals_conceded} label="gol subiti" />
              <StatTile tone="win" value={goalkeeper_stats.clean_sheets} label="porta inviolata" />
            </div>
          )}
        </div>

        {/* Goal per partita — trend */}
        {matches.length > 0 && (
          <Section title="Gol per partita">
            <Card className="p-3.5">
              <div className="flex items-end gap-[3px] h-16">
                {[...matches].reverse().map((m) => {
                  // Le barre a zero restano un moncone sulla linea di base: assente
                  // e' diverso da zero, e va comunque visto.
                  const h = m.goals === 0 ? 2 : Math.max(6, Math.round((m.goals / maxGoals) * 60))
                  const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
                  return (
                    <div key={m.id} className="flex-1 flex flex-col items-center justify-end h-full">
                      {/* Nessuna etichetta sulle barre: i valori esatti stanno nello storico qui sotto. */}
                      <div
                        className="w-full"
                        title={`${date}: ${m.goals} gol`}
                        style={{ height: h, borderRadius: '4px 4px 0 0', background: m.goals > 0 ? 'rgba(91,156,255,0.8)' : 'rgba(255,255,255,0.12)' }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="text-[10.5px] mt-2" style={{ color: C.muted }}>Ultime {matches.length} partite, dalla più vecchia</div>
            </Card>
          </Section>
        )}

        {/* Storico partite */}
        <Section title="Storico partite">
          {matches.length === 0 ? (
            <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>Nessuna partita ancora.</p>
          ) : (
            <Card className="overflow-hidden">
              {matches.map((m, i) => {
                const team = (m as unknown as { playerTeam: 'a' | 'b' | null }).playerTeam
                const sa = m.score_a ?? 0
                const sb = m.score_b ?? 0
                const isDraw = sa === sb
                const playerWins = !isDraw && ((team === 'a' && sa > sb) || (team === 'b' && sb > sa))
                const res = playerWins
                  ? { l: 'V', bg: 'rgba(74,222,128,.14)', fg: C.win }
                  : isDraw
                    ? { l: 'N', bg: 'rgba(255,255,255,.06)', fg: C.muted }
                    : { l: 'S', bg: 'rgba(248,113,113,.12)', fg: C.loss }
                const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: '2-digit' })

                return (
                  <Link key={m.id} href={`/matches/${m.id}`} className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors hover:bg-white/[0.03]"
                    style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                    <span className="w-6 h-6 rounded-[7px] flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: res.bg, color: res.fg }}>
                      {res.l}
                    </span>
                    <span className="truncate">{m.team_a_name} {sa} – {sb} {m.team_b_name}</span>
                    <span className="text-[11px] flex-shrink-0" style={{ color: C.muted }}>{date}</span>
                    <span className="ml-auto flex items-center gap-2 flex-shrink-0 font-semibold tabular-nums">
                      {m.goals > 0 && <span style={{ color: C.acc }}>{m.goals} ⚽</span>}
                      {m.own_goals > 0 && <span style={{ color: C.loss }}>{m.own_goals} OG</span>}
                    </span>
                  </Link>
                )
              })}
            </Card>
          )}
        </Section>
      </div>
    </main>
  )
}
