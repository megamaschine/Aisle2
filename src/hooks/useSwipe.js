import { useRef, useEffect, useCallback } from 'react'

export function useSwipe(ref, { onSwipeLeft, onSwipeRight, onTap }) {
  const state = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    moved: false,
    locked: null,
    currentX: 0,
    touchUsed: false,
  })

  const DEAD_ZONE = 10
  const SWIPE_THRESHOLD = 60
  const VELOCITY_THRESHOLD = 0.3

  const onTapRef = useRef(onTap)
  const onSwipeLeftRef = useRef(onSwipeLeft)
  const onSwipeRightRef = useRef(onSwipeRight)

  useEffect(() => { onTapRef.current = onTap }, [onTap])
  useEffect(() => { onSwipeLeftRef.current = onSwipeLeft }, [onSwipeLeft])
  useEffect(() => { onSwipeRightRef.current = onSwipeRight }, [onSwipeRight])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      state.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        moved: false,
        locked: null,
        currentX: 0,
        touchUsed: true,
      }
    }

    const handleTouchMove = (e) => {
      const touch = e.touches[0]
      const dx = touch.clientX - state.current.startX
      const dy = touch.clientY - state.current.startY
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (!state.current.locked && absDx < DEAD_ZONE && absDy < DEAD_ZONE) return

      if (!state.current.locked) {
        state.current.locked = absDx >= absDy ? 'horizontal' : 'vertical'
      }

      if (state.current.locked === 'vertical') return

      e.preventDefault()
      state.current.moved = true
      state.current.currentX = dx

      if (el) {
        el.style.transform = `translateX(${dx}px)`
        el.style.transition = 'none'
      }
    }

    const handleTouchEnd = (e) => {
      const { moved, locked, currentX } = state.current
      const elapsed = Date.now() - state.current.startTime
      const velocity = Math.abs(currentX) / elapsed
      const absDx = Math.abs(currentX)

      if (el) {
        el.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)'
        el.style.transform = 'translateX(0)'
      }

      if (!moved && locked !== 'horizontal') {
        // Tap — prevent synthetic click so we don't double-fire
        e.preventDefault()
        onTapRef.current?.()
        return
      }

      if (locked !== 'horizontal') return

      const isSwipe = absDx >= SWIPE_THRESHOLD || velocity >= VELOCITY_THRESHOLD
      if (isSwipe) {
        if (currentX < 0) {
          onSwipeLeftRef.current?.()
        } else {
          onSwipeRightRef.current?.()
        }
      }
    }

    // Click handler for desktop (no touch events)
    const handleClick = () => {
      if (state.current.touchUsed) {
        state.current.touchUsed = false
        return
      }
      onTapRef.current?.()
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: false })
    el.addEventListener('click', handleClick)

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('click', handleClick)
    }
  }, [ref])
}
