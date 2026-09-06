import { SkeletonBlock } from '@/components/Skeleton'

// Ricalca la struttura della pagina: intestazione, podio, riga di stagione,
// classifica a righe piatte. Altrimenti si vedrebbe un lampo del vecchio
// layout prima che arrivino i dati.
export default function StatsLoading() {
  return (
    <main className="pb-6 px-4">
      <header className="pt-7 pb-1">
        <SkeletonBlock className="h-3 w-28 mb-2.5" />
        <SkeletonBlock className="h-7 w-40" />
      </header>

      <div className="flex items-end justify-center gap-3" style={{ minHeight: 250 }}>
        {[78, 104, 78].map((w, i) => (
          <div key={i} className="flex flex-col items-center">
            <SkeletonBlock style={{ width: w, height: Math.round(w / 0.72), borderRadius: 10 }} />
            <SkeletonBlock className="h-3 mt-2.5" style={{ width: w - 20 }} />
            <SkeletonBlock className="h-4 w-7 mt-1.5" />
          </div>
        ))}
      </div>

      <div className="flex rule pt-3 pb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <SkeletonBlock className="h-5 w-8" />
            <SkeletonBlock className="h-2 w-12" />
          </div>
        ))}
      </div>

      <div className="flex rule mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 pt-3 pb-2 flex justify-center">
            <SkeletonBlock className="h-3 w-14" />
          </div>
        ))}
      </div>

      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 px-1 rule">
          <SkeletonBlock className="w-3 h-3" />
          <SkeletonBlock className="flex-1 h-3.5" />
          <SkeletonBlock className="w-9 h-4" />
        </div>
      ))}
    </main>
  )
}
