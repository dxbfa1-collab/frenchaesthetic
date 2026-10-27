'use client'

import { useEffect } from 'react'

type Tracker = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: Tracker
    fbq?: Tracker
  }
}

/**
 * One listener for every link marked data-track (WhatsApp and phone). It sends a GA4 event and a
 * Meta Pixel "Contact" event once those tags are loaded, which happens after cookie consent
 * (Phase 4). Until then it does nothing.
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-track]')
      if (!link) return
      const { track = 'contact_click', side, label } = link.dataset
      const params = { side, label, page: window.location.pathname }
      window.gtag?.('event', track, params)
      window.fbq?.('track', 'Contact', params)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
