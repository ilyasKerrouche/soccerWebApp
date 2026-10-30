// "MOTM xN": mostrato solo da chi ha almeno un riconoscimento.
export default function MotmCounter({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-gold"
      style={{ background: 'rgba(245,196,81,0.12)', border: '1px solid rgba(245,196,81,0.3)' }}
    >
      <span aria-hidden>★</span>MOTM ×{count}
    </span>
  )
}
