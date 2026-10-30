import { SkeletonBlock, SkeletonList } from '@/components/Skeleton'

export default function MatchesLoading() {
  return (
    <main className="pb-4">
      <div className="px-4 pt-10 pb-6">
        <SkeletonBlock className="h-7 w-32 mb-2" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
      <div className="px-4 pt-4 flex flex-col gap-4">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonList rows={6} />
      </div>
    </main>
  )
}
