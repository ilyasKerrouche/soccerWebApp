'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PullToRefresh() {
  const router = useRouter()
  const [pulling, setPulling] = useState(false)
  const [progress, setProgress] = useState(0)
  const startY = useRef(0)
  const threshold = 72

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) startY.current = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!startY.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy > 0 && window.scrollY === 0) {
        setPulling(true)
        setProgress(Math.min(dy / threshold, 1))
      }
    }
    const onTouchEnd = () => {
      if (progress >= 1) router.refresh()
      setPulling(false)
      setProgress(0)
      startY.current = 0
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [progress, router])

  if (!pulling && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 pointer-events-none">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
        style={{
          background: 'rgba(167,139,250,0.15)',
          border: '1px solid rgba(167,139,250,0.3)',
          color: '#a78bfa',
          opacity: progress,
          transform: `scale(${0.8 + progress * 0.2})`,
        }}
      >
        <span style={{ display: 'inline-block', transform: `rotate(${progress * 360}deg)`, transition: 'transform 0.1s' }}>↓</span>
        {progress >= 1 ? 'Rilascia per aggiornare' : 'Tira per aggiornare'}
      </div>
    </div>
  )
}
