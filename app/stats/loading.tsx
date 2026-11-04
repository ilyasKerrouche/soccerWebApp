import { SkHeader, SkPills, SkPodium, SkRows, SkScreen, SkTiles } from '@/components/Skeleton'

// Statistiche: intestazione, podio, tre numeri di stagione, pillola delle classifiche e righe
export default function StatsLoading() {
  return (
    <SkScreen className="pb-6 px-4">
      <SkHeader titleWidth={150} />
      <SkPodium />
      <div className="mt-4"><SkTiles count={3} cols={3} /></div>
      <SkPills count={4} className="mt-6" />
      <div className="mt-2.5"><SkRows rows={7} rowHeight={47} /></div>
    </SkScreen>
  )
}
