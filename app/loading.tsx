import { SkeletonHero, SkeletonCard, SkeletonList } from '@/components/Skeleton'

export default function HomeLoading() {
  return (
    <main className="pb-4">
      <SkeletonHero />
      <div className="flex border-b border-white/7">
        {['Home', 'Partite', 'Stats'].map(t => (
          <div key={t} className="flex-1 py-3 text-center text-xs text-white/20">{t}</div>
        ))}
      </div>
      <div className="px-4 pt-4 flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonList />
      </div>
    </main>
  )
}
