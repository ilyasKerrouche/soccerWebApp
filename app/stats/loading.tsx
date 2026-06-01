import { SkeletonBlock, SkeletonList } from '@/components/Skeleton'

export default function StatsLoading() {
  return (
    <main className="pb-4">
      <div className="px-4 pt-10 pb-6" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
        <SkeletonBlock className="h-7 w-36 mb-2" />
        <SkeletonBlock className="h-3 w-28" />
      </div>
      <div className="px-4 pt-5 flex flex-col gap-5">
        <div className="flex justify-center gap-4">
          {[80, 60, 80].map((w, i) => (
            <SkeletonBlock key={i} style={{ width: w, height: 110, borderRadius: 12 }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[0,1,2,3].map(i => <SkeletonBlock key={i} className="h-16 rounded-2xl" />)}
        </div>
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonList rows={5} />
      </div>
    </main>
  )
}
