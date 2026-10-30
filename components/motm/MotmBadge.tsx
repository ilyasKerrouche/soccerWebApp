// Pillola dorata col vincitore (o i co-vincitori) del Man of the Match.
export default function MotmBadge({ names }: { names: string[] }) {
  if (names.length === 0) return null
  return (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-yellow-300"
      style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.25)' }}
    >
      <span aria-hidden>⭐</span>
      <span className="truncate">MOTM · {names.join(' & ')}</span>
    </span>
  )
}
