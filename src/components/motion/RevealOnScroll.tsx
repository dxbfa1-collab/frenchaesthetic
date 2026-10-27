'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

/**
 * Soft fade-and-rise for blocks marked data-reveal, as they scroll into view.
 * Only blocks below the fold are ever hidden, and only once this has run, so content is never
 * lost without JavaScript and the first screen (LCP) is untouched. Off under reduced motion.
 */
export function RevealOnScroll() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.reveal = 'shown'
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )

    for (const el of document.querySelectorAll<HTMLElement>(
      '[data-reveal]:not([data-reveal="shown"])',
    )) {
      const onScreen = el.getBoundingClientRect().top < window.innerHeight * 0.92
      if (el.dataset.reveal !== 'pending' && onScreen) continue
      el.dataset.reveal = 'pending'
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [pathname])

  return null
}
