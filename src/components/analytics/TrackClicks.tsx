'use client'

import { useEffect } from 'react'

type Tracker = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: Tracker
    fbq?: Tracker
  }
}

const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term']

/**
 * One listener for every link marked data-track (WhatsApp and phone). It sends a GA4 event and a
 * Meta Pixel "Contact" event once those tags are loaded, which happens after cookie consent
 * (Phase 4). Until then it does nothing.
 *
 * It also keeps the last ad campaign's UTM tags in a first-party cookie for 30 days, so a form sent
 * later can be traced back to the campaign (saved with each enrollment and booking).
 */
export function TrackClicks() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utm = Object.fromEntries(
      UTM_KEYS.map((key) => [key, params.get(`utm_${key}`)?.slice(0, 150)]).filter(
        ([, value]) => value,
      ),
    )
    if (Object.keys(utm).length > 0) {
      document.cookie = `fa_utm=${encodeURIComponent(JSON.stringify(utm))}; Max-Age=${30 * 24 * 3600}; Path=/; SameSite=Lax`
    }
  }, [])

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
