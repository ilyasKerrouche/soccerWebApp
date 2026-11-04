import { C } from '@/components/ui'
import { Bone, SkCard, SkPills, SkPitch, SkRows, SkScore, SkScreen, SkSection } from '@/components/Skeleton'

// Home: risultato dell'ultima partita, campo 3D, pillola, prossima partita e marcatori
export default function HomeLoading() {
  return (
    <SkScreen className="pb-6 pt-4">
      <SkScore />
      <SkPitch />
      <SkPills className="mx-4 mt-4" />
      <div className="px-4 pt-5 flex flex-col gap-6">
        <SkSection titleWidth={120}>
          <SkCard className="p-3.5">
            <Bone className="h-2.5 w-16" />
            <Bone className="h-[17px] w-44 mt-2" />
            <Bone className="h-3 w-12 mt-1.5" />
            <div className="flex gap-2 mt-3">
              {[0, 1, 2].map((i) => <div key={i} className="flex-1 h-[46px] rounded-[10px]" style={{ background: C.surf2 }} />)}
            </div>
            <Bone className="h-9 w-full mt-3 rounded-[10px]" />
          </SkCard>
        </SkSection>
        <SkSection titleWidth={170}>
          <SkRows rows={3} />
        </SkSection>
      </div>
    </SkScreen>
  )
}
