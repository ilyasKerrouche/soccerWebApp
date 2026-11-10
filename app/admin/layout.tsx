// Le pagine admin mostrano dati appena modificati: nessuna lettura in cache.
// (Next 14 altrimenti tiene in cache per sempre le GET del server, anche con force-dynamic.)
export const fetchCache = 'force-no-store'
// Sempre generate a richiesta: alcune letture non usano i cookie, e senza questo Next
// proverebbe a generarle statiche in build (dove una lettura no-store fa fallire la build).
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
