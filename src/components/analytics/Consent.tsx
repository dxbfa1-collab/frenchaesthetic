'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { buttonClass } from '@/components/ui/Button'

const COOKIE = 'fa_consent'
const OPEN_EVENT = 'fa:consent-open'
const CHANGE_EVENT = 'fa:consent-change'

type Choice = 'granted' | 'denied'

/** The saved choice; "unset" before the visitor decides, "server" while rendering on the server. */
function readChoice(): Choice | 'unset' {
  const match = document.cookie.match(/(?:^|;\s*)fa_consent=(granted|denied)/)
  return (match?.[1] as Choice | undefined) ?? 'unset'
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

/** Opens the cookie notice again, from the "Cookie settings" link in the footer. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="transition-colors hover:text-heading"
    >
      Cookie settings
    </button>
  )
}

/**
 * Brief §9: marketing tags load only after consent. GA4 and the Meta Pixel load here once the
 * visitor accepts, and only when their IDs are set in Site settings. The choice is kept for
 * 180 days in a first-party cookie. With no IDs set there is nothing to consent to, so no notice.
 */
export function Consent({
  ga4Id,
  metaPixelId,
}: {
  ga4Id?: string | null
  metaPixelId?: string | null
}) {
  // IDs are checked, because they are written into a script.
  const ga4 = ga4Id && /^G-[A-Z0-9]{4,20}$/.test(ga4Id) ? ga4Id : null
  const pixel = metaPixelId && /^\d{5,20}$/.test(metaPixelId) ? metaPixelId : null
  const choice = useSyncExternalStore(subscribe, readChoice, () => 'server' as const)
  const [reopened, setReopened] = useState(false)
  const pathname = usePathname()
  const firstPath = useRef(true)

  useEffect(() => {
    const reopen = () => setReopened(true)
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  // The Pixel counts the first page itself; later client-side page changes are sent here.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false
      return
    }
    window.fbq?.('track', 'PageView')
  }, [pathname])

  if (!ga4 && !pixel) return null

  const open = choice === 'unset' || (reopened && choice !== 'server')

  const decide = (value: Choice) => {
    document.cookie = `${COOKIE}=${value}; Max-Age=${180 * 24 * 3600}; Path=/; SameSite=Lax`
    // Withdrawing consent stops the tags, which are already in the page, on the next load.
    if (value === 'denied' && choice === 'granted') window.location.reload()
    setReopened(false)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <>
      {choice === 'granted' && ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      )}
      {choice === 'granted' && pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}

      {open && (
        <div
          role="region"
          aria-label="Cookie notice"
          className="tone-dark fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 rounded-[6px] border border-hairline bg-deep-charcoal p-5 shadow-2xl sm:inset-x-auto sm:left-6 sm:max-w-md lg:bottom-6"
        >
          <p className="text-[0.9375rem] text-fg">
            We would like to use analytics cookies to see which pages and adverts help people find
            us. They load only if you accept.{' '}
            <Link href="/policies/privacy" className="underline underline-offset-4">
              Privacy policy
            </Link>
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => decide('granted')}
              className={buttonClass('primary')}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => decide('denied')}
              className={buttonClass('outline')}
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  )
}
