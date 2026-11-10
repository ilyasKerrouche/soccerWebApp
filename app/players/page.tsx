import { cachedPlayedDates, cachedPlayersWithStats } from '@/lib/queries/cached'
import PlayersClient from '@/components/PlayersClient'
import SeasonPicker from '@/components/SeasonPicker'
import { availableSeasons, currentSeason, parseSeason, seasonEmptyText } from '@/lib/season'

// Dipende da ?stagione=: la cache sta sui dati (lib/queries/cached.ts), non sulla pagina
export const dynamic = 'force-dynamic'

export default async function PlayersPage({ searchParams }: { searchParams: { stagione?: string | string[] } }) {
  const now = new Date()
  const season = parseSeason(searchParams.stagione, now)
  const [all, dates] = await Promise.all([cachedPlayersWithStats(season), cachedPlayedDates()])
  // In una stagione compare solo chi ha giocato; in "Sempre" tutti i giocatori attivi, come prima
  const players = season === 'all' ? all : all.filter((p) => p.total_appearances > 0)
  const emptyText = season !== 'all' && players.length === 0 ? seasonEmptyText(season) : null
  return (
    <PlayersClient
      initialPlayers={players}
      emptyText={emptyText}
      picker={<SeasonPicker seasons={availableSeasons(dates, now)} current={currentSeason(now)} active={season} />}
    />
  )
}
