import { getAllMatchesWithPlayers } from '@/lib/queries/matches'
import MatchCard from '@/components/MatchCard'
import NextMatchCard from '@/components/NextMatchCard'
import { getAllMotmWinners } from '@/lib/queries/motm'
import PageHeader from '@/components/PageHeader'
import SeasonPicker from '@/components/SeasonPicker'
import { availableSeasons, currentSeason, inSeason, parseSeason, seasonEmptyText } from '@/lib/season'
import { groupByMonth } from '@/lib/monthGroups'
import { C, Card, Section } from '@/components/ui'

// Dipende da ?stagione=
export const dynamic = 'force-dynamic'

export default async function MatchesPage({ searchParams }: { searchParams: { stagione?: string | string[] } }) {
  const now = new Date()
  const season = parseSeason(searchParams.stagione, now)
  const isCurrent = season === currentSeason(now)
  const matches = await getAllMatchesWithPlayers()
  // In programma solo nella stagione in corso, tutte (anche quelle gia' fissate per gennaio). La piu' vicina per prima
  const upcoming = isCurrent ? matches.filter((m) => m.is_upcoming).sort((a, b) => a.played_at.localeCompare(b.played_at)) : []
  const allPlayed = matches.filter((m) => !m.is_upcoming)
  const played = allPlayed.filter((m) => inSeason(m.played_at, season))
  const picker = <SeasonPicker seasons={availableSeasons(allPlayed.map((m) => m.played_at), now)} current={currentSeason(now)} active={season} />

  // Un errore nei dati MOTM non deve far cadere la lista: niente badge.
  let winners: Record<string, string[]> = {}
  try {
    winners = await getAllMotmWinners()
  } catch (e) {
    console.error('MOTM winners failed', e)
  }
  const motmNames = (m: (typeof played)[number]) =>
    m.match_players.filter((mp) => (winners[m.id] ?? []).includes(mp.player.id)).map((mp) => mp.player.name)

  return (
    <main className="pb-6 px-4">
      <PageHeader title="Partite" eyebrow={`${played.length} giocate`} aside={picker} />

      <div className="pt-5 flex flex-col gap-6">
        {upcoming.length > 0 && (
          <Section title="In programma">
            <div className="flex flex-col gap-2.5">
              {upcoming.map((m) => <NextMatchCard key={m.id} match={m} href={`/matches/${m.id}`} />)}
            </div>
          </Section>
        )}

        <Section title="Risultati">
          {played.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: C.muted }}>
              {season !== 'all' ? seasonEmptyText(season) : <>Nessuna partita registrata. Aggiungine una dall&apos;area admin.</>}
            </p>
          ) : (
            groupByMonth(played).map((g, gi) => (
              <div key={g.key}>
                <div className={`text-[11px] font-semibold uppercase tracking-[0.6px] mb-2 mx-0.5 ${gi > 0 ? 'mt-4' : ''}`} style={{ color: C.muted }}>{g.label}</div>
                <Card className="overflow-hidden">
                  {g.items.map((m, i) => (
                    <div key={m.id} style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                      <MatchCard match={m} motmNames={motmNames(m)} />
                    </div>
                  ))}
                </Card>
              </div>
            ))
          )}
        </Section>
      </div>
    </main>
  )
}
