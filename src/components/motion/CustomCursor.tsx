'use client'

import { useEffect, useRef } from 'react'

const ELIGIBLE =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)'
const INTERACTIVE = 'a, button, summary, label, [role="button"], [role="menuitem"]'
// These keep the native cursor, so the text caret and list arrows stay exact.
const NATIVE = 'input, textarea, select, [contenteditable="true"]'
const EASE = 0.22

/**
 * A dot on the pointer and a ring that follows it. Only transforms change, once per animation
 * frame, and the loop stops when the ring has caught up. Both layers ignore pointer events.
 * The class that hides the native cursor is added here, so without JavaScript nothing changes.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return
    const root = document.documentElement
    const query = window.matchMedia(ELIGIBLE)
    let stop: (() => void) | undefined

    const start = () => {
      let x = 0
      let y = 0
      let ringX = 0
      let ringY = 0
      let frame = 0
      let seen = false

      const draw = () => {
        ringX += (x - ringX) * EASE
        ringY += (y - ringY) * EASE
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
        const settled = Math.abs(x - ringX) < 0.1 && Math.abs(y - ringY) < 0.1
        frame = settled ? 0 : requestAnimationFrame(draw)
      }
      const show = (visible: boolean) => {
        dot.classList.toggle('is-visible', visible)
        ring.classList.toggle('is-visible', visible)
      }
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return show(false)
        x = event.clientX
        y = event.clientY
        if (!seen) {
          seen = true
          ringX = x
          ringY = y
          root.classList.add('has-custom-cursor')
          show(true)
        }
        if (!frame) frame = requestAnimationFrame(draw)
      }
      const onOver = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
        show(seen && !event.target.closest(NATIVE))
        ring.classList.toggle('is-active', Boolean(event.target.closest(INTERACTIVE)))
      }
      const onLeave = () => {
        seen = false
        root.classList.remove('has-custom-cursor')
        show(false)
      }

      document.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerover', onOver, { passive: true })
      root.addEventListener('pointerleave', onLeave)
      return () => {
        cancelAnimationFrame(frame)
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerover', onOver)
        root.removeEventListener('pointerleave', onLeave)
        onLeave()
      }
    }

    const sync = () => {
      stop?.()
      stop = query.matches ? start() : undefined
    }
    sync()
    query.addEventListener('change', sync)
    return () => {
      query.removeEventListener('change', sync)
      stop?.()
    }
  }, [])

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" />
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
    </>
  )
}
