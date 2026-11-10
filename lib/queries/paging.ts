// lib/queries/paging.ts
const PAGE = 1000

/**
 * PostgREST taglia le risposte a 1000 righe: si legge a pagine finche' una e' corta.
 * La query deve avere un ordine stabile (es. .order('id')), altrimenti le pagine si sovrappongono.
 */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) return rows
  }
}
