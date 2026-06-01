'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function SwipeBack() {
  const router = useRouter()
  const startX = useRef(0)
  const startY = useRef(0)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = Math.abs(e.changedTouches[0].clientY - startY.current)
      // swipe right, horizontal, starting from left edge
      if (dx > 80 && dy < 60 && startX.current < 40) {
        router.back()
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [router])

  return null
}
