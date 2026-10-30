// Le pagine admin mostrano dati appena modificati: nessuna lettura in cache.
// (Next 14 altrimenti tiene in cache per sempre le GET del server, anche con force-dynamic.)
export const fetchCache = 'force-no-store'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
