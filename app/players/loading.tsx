import { Bone, SkHeader, SkPlayerCard, SkPodium, SkScreen } from '@/components/Skeleton'

// Giocatori: intestazione, schede di ordinamento sottolineate, podio, elenco con la card piccola
export default function PlayersLoading() {
  return (
    <SkScreen className="pb-6 px-4">
      <SkHeader titleWidth={130} aside />
      <div className="flex rule mt-4 mb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 pt-3 pb-2 flex justify-center"><Bone className="h-3 w-14" /></div>
        ))}
      </div>
      <SkPodium />
      <div className="mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 px-1 rule">
            <Bone className="h-3 w-4 ml-1" />
            <SkPlayerCard width={32} />
            <div className="flex-1">
              <Bone className="h-3" style={{ width: `${[44, 36, 50, 32, 40, 46][i]}%` }} />
              <Bone className="h-2 w-8 mt-1.5" />
            </div>
            <Bone className="h-[5px] w-14" />
            <div className="flex flex-col items-end gap-1" style={{ width: 54 }}>
              <Bone className="h-4 w-5" />
              <Bone className="h-2 w-6" />
            </div>
          </div>
        ))}
      </div>
    </SkScreen>
  )
}
