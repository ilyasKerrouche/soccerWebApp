import { Bone, SkCard, SkProfileHead, SkRows, SkScreen, SkSection, SkTiles } from '@/components/Skeleton'

// Giocatore: link indietro, card al centro, numeri, gol per partita, storico
export default function PlayerLoading() {
  return (
    <SkScreen className="pb-6">
      <div className="px-4 pt-4"><Bone className="h-3.5 w-24" /></div>
      <div className="pt-3"><SkProfileHead cardWidth={118} /></div>
      <div className="px-4 pt-5 flex flex-col gap-6">
        <SkTiles count={4} />
        <SkSection titleWidth={120}>
          <SkCard className="p-3.5">
            <Bone className="h-16 w-full rounded-lg" />
            <Bone className="h-2.5 w-40 mt-2" />
          </SkCard>
        </SkSection>
        <SkSection titleWidth={120}>
          <SkRows rows={5} lead />
        </SkSection>
      </div>
    </SkScreen>
  )
}
