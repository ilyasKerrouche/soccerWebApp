// lib/queries/cached.ts
// Letture per stagione in cache: le pagine con il selettore sono dinamiche (dipendono da ?stagione=),
// quindi la cache sta qui, sui dati. La stagione e' un argomento e quindi fa parte della chiave.
// Si rinnova ogni 60 secondi, come prima, e subito quando si salva una partita, un voto o un giocatore.
import { unstable_cache } from 'next/cache'
import { getGoalkeeperRanking, getPlayersWithStats } from './players'
import { getGlobalStats } from './stats'
import { getMotmCounts, getMotmCountsSnapshot } from './motm'
import type { SeasonKey } from '@/lib/season'
import { getPlayedDates } from './matches'

export const SEASON_DATA_TAG = 'season-data'
const opts = { revalidate: 60, tags: [SEASON_DATA_TAG] }

export const cachedPlayersWithStats = unstable_cache(getPlayersWithStats, ['players-with-stats'], opts)
export const cachedGoalkeeperRanking = unstable_cache(getGoalkeeperRanking, ['goalkeeper-ranking'], opts)
export const cachedGlobalStats = unstable_cache(getGlobalStats, ['global-stats'], opts)

// Chiave nuova (v2): la voce in cache ha cambiato forma, quelle vecchie non vanno rilette.
const cachedMotmSnapshot = unstable_cache(getMotmCountsSnapshot, ['motm-counts-v2'], opts)

/** Conteggi MOTM in cache. Se nel frattempo un voto si e' chiuso da solo, la cache e' vecchia: si rilegge dal DB. */
export async function cachedMotmCounts(season: SeasonKey = 'all'): Promise<Record<string, number>> {
  const snap = await cachedMotmSnapshot(season)
  if (snap.staleAt && Date.parse(snap.staleAt) <= Date.now()) return getMotmCounts(season)
  return snap.counts
}
export const cachedPlayedDates = unstable_cache(getPlayedDates, ['played-dates'], opts)
