// lib/season.ts
// Modulo puro: stagioni ad anno solare. La prima e' il 2026 e comprende anche le partite
// di fine 2025 (ottobre-dicembre), quindi tutto cio' che viene prima del 2026 conta come 2026.

/** Anno della stagione, oppure tutte le stagioni insieme ("Sempre"). */
export type SeasonKey = number | 'all'

export const SEASON_PARAM = 'stagione'
export const FIRST_SEASON = 2026
const ALL_PARAM = 'sempre'

/** played_at e' una data "YYYY-MM-DD": l'anno si legge dal testo, senza passare da un fuso orario. */
export function seasonOf(playedAt: string): number {
  return Math.max(FIRST_SEASON, Number(playedAt.slice(0, 4)))
}

const romeYear = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric' })

export function currentSeason(now: Date): number {
  return Math.max(FIRST_SEASON, Number(romeYear.format(now)))
}

export function inSeason(playedAt: string, season: SeasonKey): boolean {
  return season === 'all' || seasonOf(playedAt) === season
}

/** Stagioni da mostrare nel selettore: dalla piu' recente, sempre compresa quella in corso, mai future. */
export function availableSeasons(playedAts: string[], now: Date): number[] {
  const cur = currentSeason(now)
  const set = new Set([cur, ...playedAts.map(seasonOf).filter((s) => s <= cur)])
  return Array.from(set).sort((a, b) => b - a)
}

/** Legge ?stagione=. Assente o non valido: la stagione in corso. */
export function parseSeason(raw: string | string[] | undefined, now: Date): SeasonKey {
  const v = Array.isArray(raw) ? raw[0] : raw
  const cur = currentSeason(now)
  if (v === ALL_PARAM) return 'all'
  if (!v || !/^\d{4}$/.test(v)) return cur
  const year = Number(v)
  return year >= FIRST_SEASON && year <= cur ? year : cur
}

/** Query string per una stagione: vuota per quella in corso, cosi' l'indirizzo di default resta pulito. */
export function seasonQuery(season: SeasonKey, now: Date): string {
  if (season === currentSeason(now)) return ''
  return `?${SEASON_PARAM}=${season === 'all' ? ALL_PARAM : season}`
}

/** Accoda al link il parametro della stagione gia' presente nell'indirizzo (valore grezzo). */
export function withSeason(href: string, raw: string | null): string {
  return raw ? `${href}?${SEASON_PARAM}=${encodeURIComponent(raw)}` : href
}

/** Stagione dei numeri sulle card di una partita: la sua, ma mai una futura (partite in programma). */
export function statsSeasonFor(playedAt: string, now: Date): number {
  return Math.min(seasonOf(playedAt), currentSeason(now))
}

export function seasonLabel(season: SeasonKey): string {
  return season === 'all' ? 'Sempre' : String(season)
}

export function seasonEmptyText(season: number): string {
  return `Stagione ${season} al via: ancora nessuna partita`
}
