import { C } from '@/components/ui'
import { Bone, SkCard, SkHeader, SkScreen, SkSection } from '@/components/Skeleton'

// Partite: intestazione, mese e righe come MatchCard (giorno a sinistra, due squadre col punteggio)
export default function MatchesLoading() {
  return (
    <SkScreen className="pb-6 px-4">
      <SkHeader titleWidth={110} />
      <div className="pt-5">
        <SkSection titleWidth={80}>
          {[5, 3].map((rows, g) => (
            <div key={g} className={g > 0 ? 'mt-4' : ''}>
              <Bone className="h-2.5 w-20 mb-2.5 mx-0.5" />
              <SkCard className="overflow-hidden">
                {Array.from({ length: rows }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3.5 py-3" style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                    <div className="w-[34px] flex flex-col items-center gap-1 flex-shrink-0">
                      <Bone className="h-4 w-5" />
                      <Bone className="h-2 w-6" />
                    </div>
                    <div className="flex-1 flex flex-col gap-[9px] py-[3px]">
                      {[0, 1].map((t) => (
                        <div key={t} className="flex justify-between">
                          <Bone className="h-3" style={{ width: `${[46, 38, 52, 34][(i + t) % 4]}%` }} />
                          <Bone className="h-3 w-3" />
                        </div>
                      ))}
                    </div>
                    <Bone className="h-2.5 w-2.5 flex-shrink-0" />
                  </div>
                ))}
              </SkCard>
            </div>
          ))}
        </SkSection>
      </div>
    </SkScreen>
  )
}
