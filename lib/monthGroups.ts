// lib/monthGroups.ts
// Modulo puro: raggruppa le partite per mese (ora italiana) per la pagina Partite.

export type MonthGroup<T> = { key: string; label: string; items: T[] }

// Una data "YYYY-MM-DD" senza ora viene letta a mezzogiorno UTC, cosi' in Italia resta lo stesso giorno.
function toDate(isoOrDate: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate) ? new Date(`${isoOrDate}T12:00:00Z`) : new Date(isoOrDate)
}

function romeParts(isoOrDate: string, opts: Intl.DateTimeFormatOptions): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', ...opts }).formatToParts(toDate(isoOrDate)).map((p) => [p.type, p.value]),
  )
}

/** Gruppi nell'ordine d'ingresso; l'anno nell'etichetta solo se diverso da quello della prima partita. */
export function groupByMonth<T extends { played_at: string }>(items: T[]): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = []
  let firstYear: string | null = null
  for (const item of items) {
    const p = romeParts(item.played_at, { year: 'numeric', month: '2-digit' })
    const key = `${p.year}-${p.month}`
    firstYear ??= p.year
    const last = groups[groups.length - 1]
    if (last?.key === key) {
      last.items.push(item)
      continue
    }
    const name = romeParts(item.played_at, { month: 'long' }).month
    const label = name.charAt(0).toUpperCase() + name.slice(1) + (p.year === firstYear ? '' : ` ${p.year}`)
    groups.push({ key, label, items: [item] })
  }
  return groups
}

export function dayParts(playedAt: string): { day: number; weekday: string } {
  const p = romeParts(playedAt, { day: 'numeric', weekday: 'short' })
  return { day: Number(p.day), weekday: p.weekday.replace('.', '') }
}
