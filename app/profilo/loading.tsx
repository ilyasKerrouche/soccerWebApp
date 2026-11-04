import { Bone, SkCard, SkProfileHead, SkScreen, SkSection, SkTiles } from '@/components/Skeleton'

// Profilo: card grande al centro, numeri, riquadro per caricare la card
export default function ProfiloLoading() {
  return (
    <SkScreen className="pb-10">
      <div className="pt-6"><SkProfileHead cardWidth={150} eyebrow /></div>
      <div className="px-4 pt-5 flex flex-col gap-6">
        <SkTiles count={4} />
        <SkSection titleWidth={90}>
          <SkCard className="p-3.5">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-2/3 mt-1.5" />
            <Bone className="h-10 w-full mt-3 rounded-[10px]" />
          </SkCard>
        </SkSection>
      </div>
    </SkScreen>
  )
}
