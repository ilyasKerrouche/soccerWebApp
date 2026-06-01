import { SkeletonBlock, SkeletonList } from '@/components/Skeleton'

export default function PlayerLoading() {
  return (
    <main className="pb-6">
      <div className="px-4 pt-10 pb-8" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}>
        <SkeletonBlock className="h-3 w-16 mb-4" />
        <div className="flex items-end gap-5">
          <SkeletonBlock style={{ width: 96, height: 133, borderRadius: 12 }} />
          <div className="flex-1">
            <SkeletonBlock className="h-6 w-32 mb-2" />
            <SkeletonBlock className="h-3 w-16 mb-4" />
            <div className="flex gap-3">
              <SkeletonBlock className="h-10 w-12" />
              <SkeletonBlock className="h-10 w-12" />
              <SkeletonBlock className="h-10 w-12" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pt-5 flex flex-col gap-5">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-16 w-full rounded-2xl" />
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonList rows={5} />
      </div>
    </main>
  )
}
