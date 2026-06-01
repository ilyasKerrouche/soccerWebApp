'use client'
import { useEffect, useState } from 'react'

type Props = {
  value: number
  className?: string
  style?: React.CSSProperties
  duration?: number
}

export default function ScoreCount({ value, className, style, duration = 1200 }: Props) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    let frame: number
    let startTime: number

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // elastic ease-out: overshoots slightly then settles
      const eased = progress === 1
        ? 1
        : 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * (2 * Math.PI) / 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <span className={className} style={style}>{display}</span>
}
