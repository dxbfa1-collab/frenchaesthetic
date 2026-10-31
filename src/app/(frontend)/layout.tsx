import type { Metadata, Viewport } from 'next'
import { Montserrat, Nunito_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

import { Consent } from '@/components/analytics/Consent'
import { TrackClicks } from '@/components/analytics/TrackClicks'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { getSiteSettings } from '@/lib/payload'
import { isStaging, siteUrl } from '@/lib/site'

import './globals.css'

// Fonts (owner, 29 Oct 2026): Montserrat for headings, for readability; Nunito Sans for the rest.
const display = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
  display: 'swap',
})

const sans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

// Light is the default (owner, 29 Oct 2026); dark stays one click away and the choice is remembered.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('fa-theme-choice')==='dark'?'dark':'light'}catch(e){}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'French Medical Aesthetics · French Aesthetics Academy',
  description:
    'Doctor-led aesthetic treatments in Lahore and Karachi, and hands-on aesthetics training in Lahore with a supervised internship.',
  robots: isStaging ? { index: false, follow: false } : undefined,
  // Shared pages carry neither logo, so their share image sets the two names in type.
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    images: [
      {
        url: '/og/site.png',
        width: 1200,
        height: 630,
        alt: 'French Medical Aesthetics and French Aesthetics Academy',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html
      lang="en"
      data-theme="light"
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
        <CustomCursor />
        <TrackClicks />
        <Consent ga4Id={settings.ga4Id} metaPixelId={settings.metaPixelId} />
      </body>
    </html>
  )
}
