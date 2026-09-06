import type { Result } from '@/lib/rating'

const STYLE: Record<Result, { color: string; label: string }> = {
  W: { color: '#4ade80', label: 'Vittoria' },
  D: { color: '#facc15', label: 'Pareggio' },
  L: { color: '#f87171', label: 'Sconfitta' },
}

type Props = {
  form: Result[] | undefined
  size?: number
  className?: string
}

/** Ultimi risultati, dal piu' recente. Il title serve perche' il colore da solo non basta. */
export default function FormDots({ form, size = 6, className = '' }: Props) {
  if (!form || form.length === 0) return null
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {form.map((r, i) => (
        <span
          key={i}
          title={STYLE[r].label}
          className="rounded-full block"
          style={{ width: size, height: size, background: STYLE[r].color, opacity: 1 - i * 0.12 }}
        />
      ))}
    </span>
  )
}
