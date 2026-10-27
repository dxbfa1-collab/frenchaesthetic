import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Nunito_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

import { TrackClicks } from '@/components/analytics/TrackClicks'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { isStaging, siteUrl } from '@/lib/site'

import './globals.css'

// Brand fonts (both guidelines): Cormorant Garamond Bold / Bold Italic for headlines, Nunito Sans for the rest.
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: '700',
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const sans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

// Runs before first paint so a saved light theme never flashes dark. Dark is the brand default.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('fa-theme')==='light'?'light':'dark'}catch(e){}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'French Medical Aesthetics · French Aesthetics Academy',
  description:
    'Doctor-led aesthetic treatments in Lahore and Karachi, and hands-on aesthetics training in Lahore with a supervised internship.',
  robots: isStaging ? { index: false, follow: false } : undefined,
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        {children}
        <RevealOnScroll />
        <TrackClicks />
      </body>
    </html>
  )
}
