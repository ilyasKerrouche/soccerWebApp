import Link from 'next/link'
import type { Player } from '@/lib/types'
import type { GoldenPair, MatchRecord, PlayerRecord, Records } from '@/lib/records'
import PlayerCard from './PlayerCard'
import { C, Card, Section } from './ui'

export const PAIR_MIN_GAMES = 5

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'Europe/Rome' })

function Tile({ label, value, unit, wide, children }: { label: string; value: number; unit: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <Card className={`p-3 min-w-0 flex flex-col ${wide ? 'col-span-2' : ''}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: C.muted }}>{label}</div>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span className="numeric text-[30px] font-bold leading-none" style={{ color: C.gold }}>{value}</span>
        <span className="text-[11px] leading-tight" style={{ color: C.muted }}>{unit}</span>
      </div>
      <div className="mt-2 flex flex-col gap-1 text-[12.5px] leading-snug">{children}</div>
    </Card>
  )
}

function More({ n }: { n: number }) {
  return n > 0 ? <div className="text-[11px]" style={{ color: C.muted }}>e altri {n}</div> : null
}

function MatchLines({ rec }: { rec: MatchRecord }) {
  return (
    <>
      {rec.matches.map((m) => (
        <Link key={m.id} href={`/matches/${m.id}`} className="block truncate hover:opacity-80">
          <span className="numeric text-[14px] font-semibold">{m.score_a} – {m.score_b}</span>
          <span style={{ color: C.muted }}> · {shortDate(m.played_at)}</span>
        </Link>
      ))}
      <More n={rec.more} />
    </>
  )
}

function PlayerLines({ rec }: { rec: PlayerRecord<Player> }) {
  return (
    <>
      {rec.holders.map((h) => (
        <Link key={`${h.player.id}-${h.matchId ?? ''}`} href={h.matchId ? `/matches/${h.matchId}` : `/players/${h.player.id}`} className="block truncate hover:opacity-80">
          {h.player.name}
          {h.played_at && <span style={{ color: C.muted }}> · {shortDate(h.played_at)}</span>}
        </Link>
      ))}
      <More n={rec.more} />
    </>
  )
}

/** Scheda "Record" delle Statistiche: bacheca dei record e coppie d'oro. */
export default function RecordsBoard({ records, pairs }: { records: Records<Player>; pairs: GoldenPair<Player>[] }) {
  const r = records
  const tiles = [
    r.biggestWin && { key: 'win', label: 'Vittoria più larga', value: r.biggestWin.value, unit: 'gol di scarto', body: <MatchLines rec={r.biggestWin} /> },
    r.mostGoalsMatch && { key: 'goals', label: 'Partita con più gol', value: r.mostGoalsMatch.value, unit: 'gol in tutto', body: <MatchLines rec={r.mostGoalsMatch} /> },
    r.longestScoringStreak && { key: 'sstreak', label: 'Serie di gol', value: r.longestScoringStreak.value, unit: 'partite di fila in gol', body: <PlayerLines rec={r.longestScoringStreak} /> },
    r.longestWinStreak && { key: 'wstreak', label: 'Serie di vittorie', value: r.longestWinStreak.value, unit: 'vittorie di fila', body: <PlayerLines rec={r.longestWinStreak} /> },
    r.mostGoalsInMatch && { key: 'single', label: 'Più gol in una partita', value: r.mostGoalsInMatch.value, unit: 'gol', body: <PlayerLines rec={r.mostGoalsInMatch} /> },
  ].filter((t): t is NonNullable<typeof t> => !!t)

  // Chi ha piu' partite con esattamente 2, 3, 4 gol, e con 5 o piu'
  const multi = [
    { key: 'braces', label: 'Doppiette', rec: r.multi.braces },
    { key: 'hat', label: 'Triplette', rec: r.multi.hatTricks },
    { key: 'poker', label: 'Poker', rec: r.multi.pokers },
    { key: 'manita', label: 'Manite', note: '5+ gol', rec: r.multi.manitas },
  ].filter((x) => x.rec)

  return (
    <div className="flex flex-col gap-6 animate-section">
      <Section title="Bacheca dei record">
        {tiles.length === 0 ? (
          <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>Ancora nessun record: servono partite giocate.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {tiles.map((t, i) => (
              // Se i riquadri sono dispari l'ultimo prende tutta la riga
              <Tile key={t.key} label={t.label} value={t.value} unit={t.unit} wide={i === tiles.length - 1 && tiles.length % 2 === 1}>{t.body}</Tile>
            ))}
          </div>
        )}
      </Section>

      {multi.length > 0 && (
        <Section title="Bomber seriali">
          <Card className="overflow-hidden">
            {multi.map(({ key, label, note, rec }, i) => (
              <div key={key} className="flex items-center gap-3 px-3.5 py-2.5" style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                <span className="w-[74px] flex-shrink-0">
                  <span className="block text-[13px] font-semibold">{label}</span>
                  {note && <span className="block text-[10px]" style={{ color: C.muted }}>{note}</span>}
                </span>
                <span className="flex-1 min-w-0 text-[13px] leading-snug">
                  {rec!.holders.map((h) => (
                    <Link key={h.player.id} href={`/players/${h.player.id}`} className="block truncate text-white/85 hover:opacity-80">{h.player.name}</Link>
                  ))}
                  {rec!.more > 0 && <span className="block text-[11px]" style={{ color: C.muted }}>e altri {rec!.more}</span>}
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="numeric text-[19px] font-semibold leading-none block" style={{ color: C.gold }}>{rec!.value}</span>
                  <span className="text-[10px] text-muted block mt-0.5">{rec!.value === 1 ? 'volta' : 'volte'}</span>
                </span>
              </div>
            ))}
          </Card>
        </Section>
      )}

      <Section title="Coppie d'oro">
        {pairs.length === 0 ? (
          <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>Nessuna coppia con almeno {PAIR_MIN_GAMES} partite insieme.</p>
        ) : (
          <Card className="overflow-hidden">
            {pairs.map((p, i) => (
              <div key={`${p.a.id}-${p.b.id}`} className="flex items-center gap-3 px-3.5 py-2.5" style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                <span className={`numeric text-[13px] w-4 text-right ${i === 0 ? 'text-brand font-bold' : 'text-muted'}`}>{i + 1}</span>
                <span className="flex flex-shrink-0">
                  <PlayerCard player={p.a} width={28} />
                  <span className="-ml-2.5"><PlayerCard player={p.b} width={28} /></span>
                </span>
                <span className="flex-1 min-w-0 text-[13px] leading-tight">
                  <Link href={`/players/${p.a.id}`} className={`block truncate ${i === 0 ? 'font-semibold text-white' : 'font-medium text-white/85'}`}>{p.a.name}</Link>
                  <Link href={`/players/${p.b.id}`} className={`block truncate ${i === 0 ? 'font-semibold text-white' : 'font-medium text-white/85'}`}>{p.b.name}</Link>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="numeric text-[19px] font-semibold leading-none block" style={i === 0 ? { color: C.gold } : undefined}>
                    {Math.round(p.winRate * 100)}%
                  </span>
                  <span className="text-[10px] tabular-nums text-muted block mt-0.5">{p.wins} vinte su {p.games}</span>
                </span>
              </div>
            ))}
          </Card>
        )}
        <p className="text-[11px] mt-2 mx-0.5" style={{ color: C.muted }}>
          Compagni nella stessa squadra, con almeno {PAIR_MIN_GAMES} partite insieme. Nell&apos;ordine pesa un po&apos; meno chi ha giocato poco insieme.
        </p>
      </Section>
    </div>
  )
}
