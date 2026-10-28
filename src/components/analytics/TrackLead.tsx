'use client'

import { useEffect } from 'react'

/**
 * Reports a sent form (booking or enrollment) as a GA4 "generate_lead" and a Meta Pixel "Lead"
 * event. The tags load only after cookie consent, and may load a moment after this page, so it
 * waits up to five seconds for them; without consent nothing is sent.
 */
export function TrackLead({ side, label }: { side: 'clinic' | 'academy'; label: string }) {
  useEffect(() => {
    let tries = 0
    const timer = window.setInterval(() => {
      tries++
      if (window.gtag || window.fbq) {
        const params = { side, label, page: window.location.pathname }
        window.gtag?.('event', 'generate_lead', params)
        window.fbq?.('track', 'Lead', params)
        window.clearInterval(timer)
      } else if (tries >= 20) {
        window.clearInterval(timer)
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [side, label])

  return null
}
