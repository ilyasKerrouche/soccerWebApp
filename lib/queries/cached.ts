// lib/queries/cached.ts
// Letture per stagione in cache: le pagine con il selettore sono dinamiche (dipendono da ?stagione=),
// quindi la cache sta qui, sui dati. La stagione e' un argomento e quindi fa parte della chiave.
// Si rinnova ogni 60 secondi, come prima, e subito quando si salva una partita, un voto o un giocatore.
import { unstable_cache } from 'next/cache'
import { getGoalkeeperRanking, getPlayersWithStats } from './players'
import { getGlobalStats } from './stats'
import { getMotmCounts } from './motm'
import { getPlayedDates } from './matches'

export const SEASON_DATA_TAG = 'season-data'
const opts = { revalidate: 60, tags: [SEASON_DATA_TAG] }

export const cachedPlayersWithStats = unstable_cache(getPlayersWithStats, ['players-with-stats'], opts)
export const cachedGoalkeeperRanking = unstable_cache(getGoalkeeperRanking, ['goalkeeper-ranking'], opts)
export const cachedGlobalStats = unstable_cache(getGlobalStats, ['global-stats'], opts)
export const cachedMotmCounts = unstable_cache(getMotmCounts, ['motm-counts'], opts)
export const cachedPlayedDates = unstable_cache(getPlayedDates, ['played-dates'], opts)
