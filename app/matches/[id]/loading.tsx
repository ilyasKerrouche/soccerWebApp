import { Bone, SkCard, SkPitch, SkRows, SkScore, SkScreen, SkSection } from '@/components/Skeleton'

// Dettaglio partita: risultato grande, campo 3D, riquadro MOTM, marcatori
export default function MatchDetailLoading() {
  return (
    <SkScreen className="pb-6 pt-6">
      <SkScore big />
      <SkPitch />
      <div className="px-4 pt-4 flex flex-col gap-6">
        <SkCard className="p-4">
          <Bone className="h-[15px] w-36" />
          <Bone className="h-3 w-52 mt-3" />
        </SkCard>
        <SkSection titleWidth={90}>
          <SkRows rows={4} />
        </SkSection>
      </div>
    </SkScreen>
  )
}
