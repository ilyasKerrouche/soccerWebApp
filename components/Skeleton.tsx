export function SkeletonBlock({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)', ...style }}
    />
  )
}

export function SkeletonHero() {
  return (
    <div className="px-4 pt-10 pb-8" style={{ background: 'linear-gradient(180deg,#1a0533 0%,#0d0d1f 100%)' }}>
      <SkeletonBlock className="h-3 w-24 mb-6" />
      <div className="flex justify-center gap-8 mb-4">
        <SkeletonBlock style={{ width: 64, height: 80 }} />
        <SkeletonBlock className="w-8 h-6 self-center" />
        <SkeletonBlock style={{ width: 64, height: 80 }} />
      </div>
      <SkeletonBlock className="h-4 w-32 mx-auto" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <SkeletonBlock className="h-3 w-24 mb-3" />
      <SkeletonBlock className="h-5 w-full mb-2" />
      <SkeletonBlock className="h-4 w-3/4" />
    </div>
  )
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <SkeletonBlock className="w-5 h-5 rounded-lg flex-shrink-0" />
          <SkeletonBlock className="flex-1 h-4" />
          <SkeletonBlock className="w-8 h-5" />
        </div>
      ))}
    </div>
  )
}
